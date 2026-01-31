// Copyright 2015-present 650 Industries. All rights reserved.

import SwiftUI

extension Color {
  static var expoSecondarySystemBackground: Color {
    if #available(iOS 13.0, *) {
      return Color(UIColor.secondarySystemBackground)
    }
    return Color.gray.opacity(0.2)
  }

  static var expoSystemGroupedBackground: Color {
    if #available(iOS 13.0, *) {
      return Color(UIColor.systemGroupedBackground)
    }
    return Color.gray.opacity(0.1)
  }

  static var expoSystemBackground: Color {
    if #available(iOS 13.0, *) {
      return Color(UIColor.systemBackground)
    }
    return Color.white
  }

  static var expoSystemGray4: Color {
    if #available(iOS 13.0, *) {
      return Color(UIColor.systemGray4)
    }
    return Color.gray.opacity(0.4)
  }

  static var expoSystemGray6: Color {
    if #available(iOS 13.0, *) {
      return Color(UIColor.systemGray6)
    }
    return Color.gray.opacity(0.1)
  }
}
