using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
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
            //Assembly asm = System.Reflection.Assembly.GetExecutingAssembly();

            this.Resources.MergedDictionaries.Clear();
            this.Resources.MergedDictionaries.Add(
                new ResourceDictionary()
                {
                    Source = new Uri(@"pack://application:,,,/BOCTS.Client.Controls.Authorization;component/Res/Dictionary1A.xaml")
                }
                ); 

     ////           < UserControl.Resources >
     ////   < ResourceDictionary >
     ////       < ResourceDictionary.MergedDictionaries >
     ////           < ResourceDictionary Source = "Dictionary1.xaml" ></ ResourceDictionary >
 
     ////        </ ResourceDictionary.MergedDictionaries >
 
     ////    </ ResourceDictionary >
 
     ////</ UserControl.Resources >
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            this.DataContext = new QueueWindow_Model(this); 
        }
         


        //private void Button_Click(object sender, RoutedEventArgs e)
        //{
        //    string datafilepath = @"D:\Work\ClientHTMLSPA\BOCTS.Client.Controls.Authorization\json_template -refresh.json";
        //    string jsonstr = System.IO.File.ReadAllText(datafilepath, Encoding.UTF8);
        //    //var x =(JObject)JsonConvert.DeserializeObject();
        //    Rootobject dataobj = Newtonsoft.Json.JsonConvert.DeserializeObject<Rootobject>(jsonstr);

        //    (this.DataContext as Rootobject).XSenditems = dataobj.XSenditems;
        //    (this.DataContext as Rootobject).XReceiveitems = dataobj.XReceiveitems;
        //    MessageBox.Show("Done!");
        //}
    }
}
