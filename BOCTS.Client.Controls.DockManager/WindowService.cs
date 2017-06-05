using BOCTS.Client.FrameWork;
using Microsoft.Practices.Prism.Regions;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Linq;
using System.Text;
using Xceed.Wpf.AvalonDock;
using Xceed.Wpf.AvalonDock.Layout;

namespace BOCTS.Client.Controls.DockManager
{
    [Export("WindowService", typeof(IWindowService))]
    public class WindowService : IWindowService
    {
        #region 成员
        IRegion _DockRegion;
        DockingManager _DockingManager;
        bool _InnerClose = false;
        #endregion

        #region 构造函数
        [ImportingConstructor()]
        public WindowService(IRegionManager regionManager)
        {
            _DockRegion = regionManager.Regions["MainRegion"];
            _DockingManager = _DockRegion.GetView("DockContainer") as DockingManager;
            if (_DockingManager == null)
            {
                _DockingManager = new DockContainer();
                _DockRegion.Add(_DockingManager, "DockContainer");
                _DockingManager.ActiveContentChanged += (sender, e) =>
                {
                    if (this.ActiveContentChanged != null)
                    {
                        var ac = (sender as DockingManager).ActiveContent;
                        if (ac != null)
                            this.ActiveContentChanged(ac, e);
                    }
                };
            }
            _DockRegion.Activate(_DockingManager);
        }
        #endregion

        Dictionary<string, ILayoutContent> LayoutContents = new Dictionary<string, ILayoutContent>();
        Dictionary<string, CLRPropertiesBindingManager> BindingManagers = new Dictionary<string, CLRPropertiesBindingManager>();
        LayoutContent CreateLayoutContent(ILayoutContent content)
        {
            LayoutContent lc = null;
            CLRPropertiesBindingManager cm = null;
            if (content.IsDocument)
            {
                lc = new LayoutDocument()
                {
                    Content = content.Content,
                    ContentId = content.ContentId
                };
                cm = new CLRPropertiesBindingManager(content, lc, typeof(ILayoutContent), typeof(LayoutDocument));
                cm.CreateBinding("Description");
            }
            else
            {
                lc = new LayoutAnchorable()
                {
                    Content = content.Content,
                    ContentId = content.ContentId
                };
                cm = new CLRPropertiesBindingManager(content, lc, typeof(ILayoutContent), typeof(LayoutAnchorable));
                cm.CreateBinding("CanAutoHide");
                cm.CreateBinding("CanHide");
            }
            cm.CreateBinding("Title");
            cm.CreateBinding("ToolTip");
            cm.CreateBinding("CanClose");
            cm.CreateBinding("CanFloat");
            cm.CreateBinding("FloatingHeight");
            cm.CreateBinding("FloatingLeft");
            cm.CreateBinding("FloatingTop");
            cm.CreateBinding("FloatingWidth");
            cm.CreateBinding("IconSource");
            cm.CreateBinding("IsActive");
            cm.CreateBinding("IsMaximized");
            cm.CreateBinding("IsSelected");
           
            cm.Bind();
            BindingManagers.Add(content.ContentId, cm);
            lc.Closing += layoutAnchorable_Closing;
            lc.Closed += layoutAnchorable_Closed;
            content.Closing += content_Closing;
            LayoutContents.Add(content.ContentId, content);
            return lc;
        }

        void content_Closing(object sender, CancelEventArgs e)
        {
            if (_InnerClose)
                return;
            var lc = sender as ILayoutContent;
            this.Close(lc.ContentId);
        }

        void layoutAnchorable_Closing(object sender, CancelEventArgs e)
        {
            LayoutAnchorable c = sender as LayoutAnchorable;
            if (c == null)
                return;
            ILayoutContent lc = null;
            if (LayoutContents.TryGetValue(c.ContentId, out lc))
            {
                _InnerClose = true;
                e.Cancel = lc.Close();
                _InnerClose = false;
                if (!e.Cancel)
                {
                    lc.Closing -= content_Closing;
                    c.Closing -= layoutAnchorable_Closing;
                }
            }
        }

        void layoutAnchorable_Closed(object sender, EventArgs e)
        {
            LayoutAnchorable c = sender as LayoutAnchorable;
            if (c == null)
                return;
            c.Closed -= layoutAnchorable_Closed;
            CLRPropertiesBindingManager bm = null;
            if (BindingManagers.TryGetValue(c.ContentId, out bm))
            {
                BindingManagers.Remove(c.ContentId);
                bm.Dispose();
            }
            ILayoutContent lc = null;
            if (this.ContentClosed != null && LayoutContents.TryGetValue(c.ContentId, out lc))
            {
                this.ContentClosed(lc, new EventArgs());
            }

            LayoutContents.Remove(c.ContentId);

        }

        public ILayoutContent ActiveContent
        {
            get
            {
                return _DockingManager.ActiveContent as ILayoutContent;
            }
        }

        LayoutContent GetLayoutByID(string contentID)
        {
            if (_DockingManager.Layout == null)
                return null;
            return _DockingManager.Layout.Descendents().OfType<LayoutContent>().FirstOrDefault((e) => { return e.ContentId == contentID; });
        }
        LayoutAnchorable GetLayoutAnchorableByID(string id)
        {
            if (_DockingManager.Layout == null)
                return null;
            return _DockingManager.Layout.Descendents().OfType<LayoutAnchorable>().FirstOrDefault((e) => { return e.ContentId == id; });
        }
        LayoutDocument GetLayoutDocumentByID(string id)
        {
            if (_DockingManager.Layout == null)
                return null;
            return _DockingManager.Layout.Descendents().OfType<LayoutDocument>().FirstOrDefault((e) => { return e.ContentId == id; });
        }
        LayoutDocumentPane GetLayoutDocumentPane()
        {
            return _DockingManager.Layout.Descendents().OfType<LayoutDocumentPane>().FirstOrDefault();

        }

        public ILayoutContent GetLayoutContentByID(string contentID)
        {
           ILayoutContent d = null;
            LayoutContents.TryGetValue(contentID, out d);
            return d;
        }

        LayoutAnchorable AddToLayout(ILayoutContent content, FrameWork.AnchorableShowStrategy strategy)
        {
            var layoutContent = GetLayoutAnchorableByID(content.ContentId);
            if (layoutContent != null)
            {
                layoutContent.IsActive = true;
            }
            else
            {
                layoutContent = CreateLayoutContent(content) as LayoutAnchorable;
                if (strategy == FrameWork.AnchorableShowStrategy.Most)
                {
                    var documentPane = GetLayoutDocumentPane();
                    if (documentPane != null)
                    {
                        documentPane.Children.Add(layoutContent);
                    }
                    else
                    {
                        layoutContent.AddToLayout(_DockingManager, Xceed.Wpf.AvalonDock.Layout.AnchorableShowStrategy.Most);
                    }
                }
                else
                {
                    layoutContent.AddToLayout(_DockingManager, (Xceed.Wpf.AvalonDock.Layout.AnchorableShowStrategy)strategy);
                }
            }
            return layoutContent;
        }
        LayoutDocument DockAsDocument(ILayoutContent content)
        {
            var layoutContent = GetLayoutDocumentByID(content.ContentId);
            if (layoutContent != null)
            {
                layoutContent.DockAsDocument();
            }
            else
            {
                layoutContent = CreateLayoutContent(content) as LayoutDocument;
                var documentPane = GetLayoutDocumentPane();
                if (documentPane != null)
                {
                    documentPane.Children.Add(layoutContent);
                }
            }
            return layoutContent;
        }
        public void Hide(string contentID, bool cancelable = true)
        {
            var layoutContent = GetLayoutAnchorableByID(contentID);
            if (layoutContent != null)
            {
                layoutContent.Hide(cancelable);
                return;
            }
        }
        public void Show(string contentID)
        {
            var layoutContent = GetLayoutAnchorableByID(contentID);
            if (layoutContent != null)
            {
                layoutContent.Show();
                return;
            }
            _DockRegion.Activate(_DockingManager);
        }
        public void ToggleAutoHide(string contentID)
        {
            var layoutContent = GetLayoutAnchorableByID(contentID);
            if (layoutContent != null)
            {
                layoutContent.ToggleAutoHide();
                return;
            }
        }
        public void Close(string contentID)
        {
            var layoutContent = GetLayoutAnchorableByID(contentID);
            if (layoutContent != null)
            {
                layoutContent.Close();
                return;
            }
        }
        public void Dock(ILayoutContent content, FrameWork.AnchorableShowStrategy strategy)
        {
            if (content.IsDocument)
            {
                DockAsDocument(content);
            }
            else
            {
                AddToLayout(content, strategy);
            }
            _DockRegion.Activate(_DockingManager);
        }

        public void Float(ILayoutContent content)
        {
            LayoutContent lc = null;
            if (content.IsDocument)
            {
                lc = DockAsDocument(content);
            }
            else
            {
                lc = AddToLayout(content, FrameWork.AnchorableShowStrategy.Most);
            }
            lc.Float();
            _DockRegion.Activate(_DockingManager);
        }
        public void Initial()
        { }

        public event EventHandler ActiveContentChanged;


        public event EventHandler ContentClosed;
    }
}
