#![no_std]

extern crate alloc;

use alloc::string::String;
use alloc::vec;
use alloc::vec::Vec;

#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOCATOR: lol_alloc::AssumeSingleThreaded<lol_alloc::LeakingAllocator> =
    unsafe { lol_alloc::AssumeSingleThreaded::new(lol_alloc::LeakingAllocator::new()) };

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

// Credman v1 imports
#[link(wasm_import_module = "credman")]
extern "C" {
    fn GetRequestSize(size: *mut u32);
    fn GetRequestBuffer(buffer: *mut u8);
    fn GetCredentialsSize(size: *mut u32);
    fn ReadCredentialsBuffer(buffer: *mut u8, offset: usize, len: usize) -> usize;
    fn GetWasmVersion(version: *mut u32);
    fn AddStringIdEntry(
        cred_id: *const u8,
        icon: *const u8,
        icon_len: usize,
        title: *const u8,
        subtitle: *const u8,
        disclaimer: *const u8,
        warning: *const u8,
    );
}


fn read_request() -> Vec<u8> {
    let mut size: u32 = 0;
    unsafe { GetRequestSize(&mut size) };
    let mut buf = vec![0u8; size as usize];
    unsafe { GetRequestBuffer(buf.as_mut_ptr()) };
    buf
}

fn read_credentials() -> Vec<u8> {
    let mut size: u32 = 0;
    unsafe { GetCredentialsSize(&mut size) };
    let mut buf = vec![0u8; size as usize];
    unsafe { ReadCredentialsBuffer(buf.as_mut_ptr(), 0, size as usize) };
    buf
}

fn cstr(s: &str) -> Vec<u8> {
    let mut v = Vec::from(s.as_bytes());
    v.push(0);
    v
}

/// Extract the OID4VP data from the request envelope.
/// Handles both modern format {"requests":[{"protocol":"...","data":{...}}]}
/// and legacy format {"providers":[{"protocol":"...","request":"..."}]}
/// and direct DCQL format {"dcql_query":{...}}
fn extract_oid4vp_data(request: &serde_json::Value) -> Option<serde_json::Value> {
    // Direct DCQL query (our low-level registration sends request directly)
    if request.get("dcql_query").is_some() {
        return Some(request.clone());
    }

    // Modern format: {"requests": [...]}
    if let Some(requests) = request.get("requests").and_then(|r| r.as_array()) {
        for req in requests {
            let protocol = req.get("protocol").and_then(|p| p.as_str()).unwrap_or("");
            if protocol.starts_with("openid4vp") {
                if let Some(data) = req.get("data") {
                    // data can be a JSON object or a JSON string
                    if data.is_object() {
                        return Some(data.clone());
                    } else if let Some(data_str) = data.as_str() {
                        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(data_str) {
                            return Some(parsed);
                        }
                    }
                }
            }
        }
    }

    // Legacy format: {"providers": [...]}
    if let Some(providers) = request.get("providers").and_then(|p| p.as_array()) {
        for prov in providers {
            let protocol = prov.get("protocol").and_then(|p| p.as_str()).unwrap_or("");
            if protocol.starts_with("openid4vp") {
                if let Some(req_str) = prov.get("request").and_then(|r| r.as_str()) {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(req_str) {
                        return Some(parsed);
                    }
                }
            }
        }
    }

    None
}

struct MatchedEntry {
    id: String,
    title: String,
    subtitle: String,
}

#[no_mangle]
pub extern "C" fn _start() {
    // Query wasm version (import must be present for runtime compatibility)
    let mut _wasm_version: u32 = 0;
    unsafe { GetWasmVersion(&mut _wasm_version) };

    let request_bytes = read_request();
    let cred_bytes = read_credentials();
    // Parse request JSON
    let request_str = match core::str::from_utf8(&request_bytes) {
        Ok(s) => s,
        Err(_) => return,
    };
    let request: serde_json::Value = match serde_json::from_str(request_str) {
        Ok(v) => v,
        Err(_) => return,
    };

    // Extract OID4VP data from request envelope
    let oid4vp_data = match extract_oid4vp_data(&request) {
        Some(d) => d,
        None => return,
    };

    // Parse credential registry (format: [4-byte LE offset][icon bytes][JSON])
    if cred_bytes.len() < 4 {
        return;
    }
    let json_offset =
        u32::from_le_bytes([cred_bytes[0], cred_bytes[1], cred_bytes[2], cred_bytes[3]]) as usize;
    if json_offset >= cred_bytes.len() {
        return;
    }
    let json_str = match core::str::from_utf8(&cred_bytes[json_offset..]) {
        Ok(s) => s,
        Err(_) => return,
    };
    let registry: serde_json::Value = match serde_json::from_str(json_str) {
        Ok(v) => v,
        Err(_) => return,
    };

    // Extract requested VCTs from DCQL query
    let mut requested_vcts: Vec<&str> = Vec::new();
    let mut requested_format: Option<&str> = None;

    if let Some(dcql) = oid4vp_data.get("dcql_query") {
        if let Some(credentials) = dcql.get("credentials").and_then(|c| c.as_array()) {
            for cred_query in credentials {
                requested_format = cred_query.get("format").and_then(|f| f.as_str());
                if let Some(meta) = cred_query.get("meta") {
                    if let Some(vcts) = meta.get("vct_values").and_then(|v| v.as_array()) {
                        for vct in vcts {
                            if let Some(s) = vct.as_str() {
                                requested_vcts.push(s);
                            }
                        }
                    }
                    if let Some(dt) = meta.get("doctype_value").and_then(|v| v.as_str()) {
                        requested_vcts.push(dt);
                    }
                }
            }
        }
    }

    // Match credentials
    let format_key = match requested_format {
        Some("mso_mdoc") => "mso_mdoc",
        _ => "dc+sd-jwt",
    };

    let mut matched: Vec<MatchedEntry> = Vec::new();

    if let Some(format_section) = registry.get(format_key).and_then(|f| f.as_object()) {
        for (vct, entries) in format_section {
            let vct_matches =
                requested_vcts.is_empty() || requested_vcts.iter().any(|rv| *rv == vct);
            if !vct_matches {
                continue;
            }

            if let Some(entries_arr) = entries.as_array() {
                for entry in entries_arr {
                    let id = entry.get("id").and_then(|v| v.as_str()).unwrap_or("");
                    let title = entry
                        .get("title")
                        .and_then(|v| v.as_str())
                        .unwrap_or("Credential");
                    let subtitle = entry.get("subtitle").and_then(|v| v.as_str()).unwrap_or("");

                    matched.push(MatchedEntry {
                        id: String::from(id),
                        title: String::from(title),
                        subtitle: String::from(subtitle),
                    });
                }
            }
        }
    }

    if matched.is_empty() {
        return;
    }

    for entry in &matched {
        let id_c = cstr(&entry.id);
        let title_c = cstr(&entry.title);
        let subtitle_c = cstr(&entry.subtitle);

        unsafe {
            AddStringIdEntry(
                id_c.as_ptr(),
                core::ptr::null(),
                0,
                title_c.as_ptr(),
                subtitle_c.as_ptr(),
                core::ptr::null(),
                core::ptr::null(),
            );
        }
    }
}
