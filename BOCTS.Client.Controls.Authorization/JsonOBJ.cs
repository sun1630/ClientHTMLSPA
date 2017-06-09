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
        public Senditem[] Senditems { get; set; }
        public Receiveitem[] Receiveitems { get; set; }
    }

    public class Senditem
    {
        public string colum1 { get; set; }
        public string colum2 { get; set; }
        public string colum3 { get; set; }
    }

    public class Receiveitem
    {
        public string colum1 { get; set; }
        public string colum2 { get; set; }
        public string colum3 { get; set; }
    }

}
