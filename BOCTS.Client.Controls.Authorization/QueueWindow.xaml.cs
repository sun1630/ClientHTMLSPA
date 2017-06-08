using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace BOCTS.Client.Controls.Authorization
{
    /// <summary>
    /// Interaction logic for UserControl1.xaml
    /// </summary>
    public partial class QueueWindow : UserControl
    {
        public QueueWindow()
        {
            
            InitializeComponent();
            
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            string datafilepath = @"D:\Work\ClientHTMLSPA\BOCTS.Client.Controls.Authorization\json_template.json";
            string jsonstr = System.IO.File.ReadAllText(datafilepath, Encoding.UTF8);
            //var x =(JObject)JsonConvert.DeserializeObject();
            Rootobject dataobj = Newtonsoft.Json.JsonConvert.DeserializeObject<Rootobject>(jsonstr);
            m_datagrid.DataContext  = dataobj;
        }
    }
}
