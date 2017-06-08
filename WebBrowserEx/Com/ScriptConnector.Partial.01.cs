using BOCTS.Client.FrameWork;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows;

namespace BOC.UOP.Controls.WebBrowserEx.Com
{
    //[ComVisible(true)]
    public partial class ScriptConnector
    {
        private object _jsFunctionListener = null;
        public object OnExternalEvent
        {
            get
            {
                return _jsFunctionListener;
            }
            set
            {
                _jsFunctionListener = value;
            }
        }
        private object _jsStartFlowFunctionListener = null;
        public object OnExternalCallStartFlowEvent
        {
            get
            {
                return _jsStartFlowFunctionListener;
            }
            set
            {
                _jsStartFlowFunctionListener = value;
            }
        }
    }
}
