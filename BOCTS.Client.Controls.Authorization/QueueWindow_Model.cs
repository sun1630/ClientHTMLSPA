using BOCTS.Client.Authorization;
using Microsoft.Practices.Prism.Commands;
using System;
using System.Collections.Generic;
using System.ComponentModel;
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
            
            LoadData(@"D:\Work\ClientHTMLSPA\BOCTS.Client.Controls.Authorization\json_template.json");
        }

        private void ChangeStyleCommandHandler(object sender, EventArgs e)
        {
            WebAPIHelper.GetDataForAuthorization();
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
            DataGrid dg = e.Parameter as DataGrid;
            if (dg.SelectedItem == null)
                return;
            Senditem dr = dg.SelectedItem as Senditem; 

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
