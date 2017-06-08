using BOC.UOP.Controls.WebBrowserEx;
using BOCTS.Client.FrameWork;
using Fluent;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace BOCTS.Client.Controls.RibbonService
{
    /// <summary>
    /// Interaction logic for RibbonView.xaml
    /// </summary>
    public partial class RibbonView //: Ribbon
    {

        //add by Xiyue Yu for Test Panel
        private void Button2_Click(object sender, RoutedEventArgs e)
        {


            new Form1().Show();
        }
    }
}
