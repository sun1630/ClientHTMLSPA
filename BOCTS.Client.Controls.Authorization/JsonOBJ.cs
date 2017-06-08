using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOCTS.Client.Controls.Authorization
{

    public partial class Rootobject
    {
        public int count { get; set; }
        public Item[] items { get; set; }
    }

    public class Item
    {
        public string colum1 { get; set; }
        public string colum2 { get; set; }
        public string colum3 { get; set; }
    }

}
