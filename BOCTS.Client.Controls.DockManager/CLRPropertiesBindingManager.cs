using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace BOCTS.Client.Controls.DockManager
{
    public class CLRPropertiesBindingManager : IDisposable
    {
        public object Source { get; private set; }
        public object Target { get; private set; }
        public PropertyDescriptorCollection SourcePropertys { get; private set; }
        public PropertyDescriptorCollection TargetPropertys { get; private set; }
        List<CLRPropertiesBinding> Bindings = new List<CLRPropertiesBinding>();

        public void Remove(CLRPropertiesBinding binding)
        {
            Bindings.Remove(binding);
            binding.Unbind();
        }

        public void Bind()
        {
            foreach (var binding in Bindings)
            {
                binding.Bind();
            }
        }
        public void UnBind()
        {
            foreach (var binding in Bindings)
            {
                binding.Unbind();
            }
        }
        #region 构造函数
        public CLRPropertiesBindingManager(object source, object target)
            : this(source, target, null, null)
        {
        }
        public CLRPropertiesBindingManager(object source, object target, Type sourceType, Type targetType)
        {
            this.Source = source;
            this.Target = target;
            if (sourceType == null)
            {
                SourcePropertys = TypeDescriptor.GetProperties(source);
            }
            else
            {
                SourcePropertys = TypeDescriptor.GetProperties(sourceType);
            }
            if (targetType == null)
            {
                TargetPropertys = TypeDescriptor.GetProperties(target);
            }
            else
            {
                TargetPropertys = TypeDescriptor.GetProperties(targetType);
            }
        }
        #endregion

        public CLRPropertiesBinding CreateBinding(string property)
        {
            return CreateBinding(property, property);
        }
        public CLRPropertiesBinding CreateBinding(string sourceProperty, string targetProperty)
        {
            return CreateBinding(sourceProperty, targetProperty, CLRBindingMode.TwoWay);
        }
        public CLRPropertiesBinding CreateBinding(string sourceProperty, string targetProperty, CLRBindingMode mode)
        {
            return CreateBinding(sourceProperty, targetProperty, mode, null);
        }
        public CLRPropertiesBinding CreateBinding(string sourceProperty, string targetProperty, CLRBindingMode mode, IValueConverter converter)
        {
            var binding = new CLRPropertiesBinding(Source, sourceProperty, Target, targetProperty, mode, converter, SourcePropertys, TargetPropertys);
            Bindings.Add(binding);
            return binding;
        }

        public void Dispose()
        {
            this.UnBind();
            Bindings.Clear();
            Source = null;
            Target = null;
            SourcePropertys = null;
            TargetPropertys = null;
        }
    }
}
