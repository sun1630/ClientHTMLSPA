using BOC.UOP.Controls.WebBrowserEx;
using BOC.UOP.Controls.WebBrowserEx.Com;
using BOCTS.Client.FrameWork;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BOC.UOP.Controls.WebBrowserEx
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }
        private WebBrowserControl _currentWebBrowserControl;
        private void button1_Click(object sender, EventArgs e)
        {
            var wbs = 
                Utilities
                        .TryGetInstance<IWebBrowserService>
                                ("WebBrowserService") as WebBrowserService ;
            
            _currentWebBrowserControl = wbs["default"];
            ScriptConnector scriptConnector = _currentWebBrowserControl.ObjectForScripting as ScriptConnector;

            if (scriptConnector.OnExternalCallStartFlowEvent != null)
            {
                var jsListener = scriptConnector.OnExternalCallStartFlowEvent;

                object[] args = new object[2];
                args[0] = (object)this.textBox1.Text;

                new Thread
                    (
                        () =>
                        {
                            try
                            {
                                jsListener
                                    .GetType()
                                    .InvokeMember
                                            (
                                                ""
                                                , BindingFlags.InvokeMethod
                                                , null
                                                , jsListener
                                                , args
                                            );
                            }
                            catch
                            {

                            }
                        }
                    ).Start();

                
            }

        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button2_Click(object sender, EventArgs e)
        {
            ScriptConnector sc = _currentWebBrowserControl.ObjectForScripting as ScriptConnector;
            if (sc != null)
            {
                var jsFunctionListener = sc.OnExternalCallStartFlowEvent;
                if (jsFunctionListener != null)
                {
                    object[] args = new object[1];
                    args[0] = (object)this.textBox1.Text;
                    //args[1] = (object)this.textBox1.Text;

                    jsFunctionListener
                        .GetType()
                        .InvokeMember
                                (
                                    ""
                                    , BindingFlags.InvokeMethod
                                    , null
                                    , jsFunctionListener
                                    , args
                                );
                }


            }


        }
    }
}
