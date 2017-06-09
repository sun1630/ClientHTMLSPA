using Microsoft.Practices.Prism.Commands;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace BOCTS.Client.Controls.Authorization
{
    public class QueueWindow_Model:INotifyPropertyChanged
    {
        private QueueWindow _window = null;
        public Rootobject DataObj { get; set; }

        public DelegateCommand RefreshCommand
        {
            get { return this.refreshCommand; }
        }
        private DelegateCommand refreshCommand;



        public QueueWindow_Model(QueueWindow p_window)
        {
            this._window = p_window;
            this.refreshCommand = new DelegateCommand(this.RefreshCommandHandler);
            LoadData(@"D:\Work\ClientHTMLSPA\BOCTS.Client.Controls.Authorization\json_template.json");
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
