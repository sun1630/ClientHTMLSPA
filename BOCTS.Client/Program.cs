using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Windows.Threading;
using System.IO;
using System.Configuration;
using System.Windows;
using System.Xml;
using System.Collections.Specialized;
using System.Web;

namespace BOCTS.Client
{
    public static class Program
    {       

        [STAThread]
        public static void Main(string[] args)
        {
            try
            {                
                App app = new App();
                app.Run();
            }
            catch(Exception err)
            {
                System.Windows.MessageBox.Show(err.ToString());
            }
            finally
            {

            }
        }

       
    }
}
