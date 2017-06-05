using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;

namespace BOC.UOP.Controls.WebBrowserEx.AppModel
{
    public class NewWindow3EventArgs : RoutedEventArgs
    {
        public object ppDisp { get; set; }
        public bool Cancel { get; set; }
        public uint dwFlags { get; set; }
        public string bstrUrlContext { get; set; }
        public string bstrUrl { get; set; }
    }
}
