using BOC.UOP.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;
using System.Windows;
using System.Windows.Documents;
using Fasterflect;
using BOC.UOP.Utility;

namespace BOC.UOP.AppModel
{
    internal sealed class RequestSetStatusBarEventArgs : RoutedEventArgs
    {
        private SecurityCriticalDataForSet<string> _text;
        internal string Text
        {
            get
            {
                return this._text.Value;
            }
        }
        internal static RequestSetStatusBarEventArgs Clear
        {
            [SecurityCritical, SecuritySafeCritical]
            get
            {
                return new RequestSetStatusBarEventArgs(string.Empty);
            }
        }
        [SecurityCritical]
        internal RequestSetStatusBarEventArgs(string text)
        {
            this._text.Value = text;
            base.RoutedEvent = typeof(Hyperlink).GetFieldValue("RequestSetStatusBarEvent") as RoutedEvent;
        }
        [SecurityCritical]
        internal RequestSetStatusBarEventArgs(Uri targetUri)
        {
            if (targetUri == null)
            {
                this._text.Value = string.Empty;
            }
            else
            {
                this._text.Value = BindUriHelper.UriToString(targetUri);
            }
            base.RoutedEvent = typeof(Hyperlink).GetFieldValue("RequestSetStatusBarEvent") as RoutedEvent;
        }
    }
}
