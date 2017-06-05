using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BOCTS.Client.FrameWork
{
    public interface IWindowService
    {
        void Initial();
        ILayoutContent ActiveContent { get; }
        void Close(string contentID);
        void Dock(ILayoutContent content, AnchorableShowStrategy strategy);
        void Float(ILayoutContent content);
        void Hide(string contentID, bool cancelable = true);
        void Show(string contentID);
        void ToggleAutoHide(string contentID);
        event EventHandler ActiveContentChanged;
        event EventHandler ContentClosed;
    }
}
