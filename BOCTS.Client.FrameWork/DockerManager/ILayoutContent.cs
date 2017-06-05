using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Windows.Media;

namespace BOCTS.Client.FrameWork
{
    public interface ILayoutContent : INotifyPropertyChanged
    {
        string Title { get; set; }
        object ToolTip { get; set; }
        ImageSource IconSource { get; set; }
        string ContentId { get; }
        object Content { get; }
        bool CanClose { get; set; }
        bool CanFloat { get; set; }
        bool CanAutoHide { get; set; }
        bool CanHide { get; set; }
        bool IsDocument { get; set; }
        string Description { get; set; }
        double FloatingWidth { get; set; }
        double FloatingHeight { get; set; }
        double FloatingLeft { get; set; }
        double FloatingTop { get; set; }
        bool IsMaximized { get; set; }
        bool IsActive { get; set; }
        bool IsFloating { get; set; }
        bool IsSelected { get; set; }
        bool Close();
        event EventHandler IsSelectedChanged;
        event EventHandler IsActiveChanged;
        event EventHandler Closed;
        event EventHandler<CancelEventArgs> Closing;
    }
}
