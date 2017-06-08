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
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BOCTS.Client.Controls.RibbonService
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
            var  wc = (WebBrowserService)
                Utilities
                        .TryGetInstance<IWebBrowserService>
                                ("WebBrowserService")  ;
            
            //_currentWebBrowserControl = wc;
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
