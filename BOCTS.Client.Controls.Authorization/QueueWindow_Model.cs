using BOCTS.Client.Authorization;
using Microsoft.Practices.Prism.Commands;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace BOCTS.Client.Controls.Authorization
{
    public class QueueWindow_Model:INotifyPropertyChanged
    {
        [ImportMany(typeof(IAuthorizationExecInterface))]
        IEnumerable<IAuthorizationExecInterface> operations { get; set; }

        private QueueWindow _window = null;
        public Rootobject DataObj { get; set; }

        public DelegateCommand RefreshCommand{ get; set; } 
        public DelegateCommand ChangeStyleCommand{ get;set; }
        public DelegateCommand DataGridDoubleClick { get; set; }
        public QueueWindow_Model(QueueWindow p_window)
        {
            this._window = p_window;
            this.RefreshCommand = new DelegateCommand(this.RefreshCommandHandler);
            this.ChangeStyleCommand = new DelegateCommand(this.ChangeStyleCommandHandler);
            this.DataGridDoubleClick = new DelegateCommand(this.DataGridDoubleClickHandler);



            var catalog = new AggregateCatalog();

            catalog.Catalogs.Add(new AssemblyCatalog(typeof(QueueWindow_Model).Assembly));
            //catalog.Catalogs.Add(new DirectoryCatalog("Addin"));   //遍历运行目录下的Addin文件夹，查找所需的插件。
            var _container = new CompositionContainer(catalog); 
            _container.ComposeParts(this); 



            LoadData(@"D:\Work\ClientHTMLSPA\BOCTS.Client.Controls.Authorization\json_template.json");
        }

        private void ChangeStyleCommandHandler(object sender, EventArgs e)
        {
            //WebAPIHelper.GetDataForAuthorization();
            _window.Resources.MergedDictionaries.Clear();
            _window.Resources.MergedDictionaries.Add(
                new ResourceDictionary()
                {
                    Source = new Uri(@"pack://application:,,,/BOCTS.Client.Controls.Authorization;component/Res/Dictionary1B.xaml")
                }
                );
        }
        
        private void RefreshCommandHandler(object sender, EventArgs e)
        {
            LoadData(@"D:\Work\ClientHTMLSPA\BOCTS.Client.Controls.Authorization\json_template -refresh.json");
            ChangeProperty("DataObj");
            MessageBox.Show("OK");
        }
        public void LoadData(string datafilepath)
        {
            
            string jsonstr = System.IO.File.ReadAllText(datafilepath, Encoding.UTF8);
            Rootobject dataobj = Newtonsoft.Json.JsonConvert.DeserializeObject<Rootobject>(jsonstr);
            this.DataObj = dataobj;
        }

        private void DataGridDoubleClickHandler(object sender, DelegateCommandEventArgs e)
        {
            var x = operations;
            DataGrid dg = e.Parameter as DataGrid;
            if (dg.SelectedItem == null)
                return;
            Senditem dr = dg.SelectedItem as Senditem;
            foreach (IAuthorizationExecInterface item in operations)
            {
                //var instance = item.Value;
                item.Exec(dr);
            }
        }


        #region Interface INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;
        private void ChangeProperty(string p_propertyName)
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(p_propertyName));
            }
        }
        #endregion

    }
}
