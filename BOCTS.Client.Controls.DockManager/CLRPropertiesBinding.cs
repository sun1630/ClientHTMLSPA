using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Windows.Data;

namespace BOCTS.Client.Controls.DockManager
{
    public enum CLRBindingMode
    {
        OneWayToTarget,
        OneWayToSource,
        TwoWay
    }

    public class CLRPropertiesBinding
    {
        #region Memebers

        private readonly CLRBindingMode m_Mode;
        private readonly object m_Source;
        private readonly object m_Target;
        private readonly PropertyDescriptor m_SourceProperty;
        private readonly PropertyDescriptor m_TargetProperty;
        private readonly IValueConverter m_Converter;

        #endregion

        #region Constructors
        public CLRPropertiesBinding(object source, string sourceProperty, object target, string targetProperty, CLRBindingMode mode, IValueConverter converter, PropertyDescriptorCollection sourceProperties, PropertyDescriptorCollection targetProperties)
        {
            if (source == null)
            {
                throw new ArgumentNullException("source");
            }

            if (target == null)
            {
                throw new ArgumentNullException("target");
            }

            m_SourceProperty = sourceProperties.Find(sourceProperty, false);

            if (m_SourceProperty == null)
            {
                throw new ArgumentException("Invalid source property");
            }

            m_TargetProperty = targetProperties.Find(targetProperty, false);

            if (m_TargetProperty == null)
            {
                throw new ArgumentException("Invalid target property");
            }
            m_Source = source;
            m_Target = target;
            m_Mode = mode;
            m_Converter = converter;
        }
        public CLRPropertiesBinding(object source, string sourceProperty, object target, string targetProperty, CLRBindingMode mode, IValueConverter converter)
        {
            if (source == null)
            {
                throw new ArgumentNullException("source");
            }

            if (target == null)
            {
                throw new ArgumentNullException("target");
            }

            PropertyDescriptorCollection sourceProperties = TypeDescriptor.GetProperties(source);

            m_SourceProperty = sourceProperties.Find(sourceProperty, false);

            if (m_SourceProperty == null)
            {
                throw new ArgumentException("Invalid source property");
            }

            if ((mode == CLRBindingMode.TwoWay || mode == CLRBindingMode.OneWayToSource) && m_SourceProperty.IsReadOnly)
            {
                throw new ArgumentException("TwoWay and OneWayToSource are not supported on a readonly source property");
            }

            PropertyDescriptorCollection targetProperties = TypeDescriptor.GetProperties(target);


            m_TargetProperty = targetProperties.Find(targetProperty, false);

            if (m_TargetProperty == null)
            {
                throw new ArgumentException("Invalid target property");
            }

            if (mode != CLRBindingMode.OneWayToSource && m_TargetProperty.IsReadOnly)
            {
                throw new ArgumentException("TwoWay and OneWayToTarget are not supported on a readonly target property");
            }
            m_Source = source;
            m_Target = target;
            m_Mode = mode;
            m_Converter = converter;
        }
        public CLRPropertiesBinding(object source, string sourceProperty, object target, string targetProperty, IValueConverter converter = null) : this(source, sourceProperty, target, targetProperty, CLRBindingMode.TwoWay, converter) { }
        public CLRPropertiesBinding(object source, string sourceProperty, object target, string targetProperty, CLRBindingMode mode = CLRBindingMode.TwoWay) : this(source, sourceProperty, target, targetProperty, CLRBindingMode.TwoWay, null) { }
        public CLRPropertiesBinding(object source, string sourceProperty, object target, string targetProperty) : this(source, sourceProperty, target, targetProperty, CLRBindingMode.TwoWay, null) { }
        public CLRPropertiesBinding(object source, object target, string property, CLRBindingMode mode, IValueConverter converter) : this(source, property, target, property, mode, converter) { }
        public CLRPropertiesBinding(object source, object target, string property, CLRBindingMode mode) : this(source, target, property, mode, null) { }
        public CLRPropertiesBinding(object source, object target, string property, IValueConverter converter) : this(source, target, property, CLRBindingMode.TwoWay, converter) { }
        public CLRPropertiesBinding(object source, object target, string property) : this(source, target, property, CLRBindingMode.TwoWay, null) { }

        #endregion

        #region Operations

        internal void Bind()
        {
            if (m_Mode == CLRBindingMode.OneWayToTarget || m_Mode == CLRBindingMode.TwoWay)
            {
                m_SourceProperty.AddValueChanged(m_Source, SourcePropertyChanged);
            }

            if (m_Mode == CLRBindingMode.OneWayToSource || m_Mode == CLRBindingMode.TwoWay)
            {
                m_TargetProperty.AddValueChanged(m_Target, TargetPropertyChanged);
            }
            UpdateTarget();
        }

        internal void Unbind()
        {
            if (m_Mode == CLRBindingMode.OneWayToTarget || m_Mode == CLRBindingMode.TwoWay)
            {
                m_SourceProperty.RemoveValueChanged(m_Source, SourcePropertyChanged);
            }

            if (m_Mode == CLRBindingMode.OneWayToSource || m_Mode == CLRBindingMode.TwoWay)
            {
                m_TargetProperty.RemoveValueChanged(m_Target, TargetPropertyChanged);
            }
        }

        #endregion

        #region Privates

        private void SourcePropertyChanged(object sender, EventArgs e)
        {
            UpdateTarget();
        }

        private void UpdateTarget()
        {
            object value = m_SourceProperty.GetValue(m_Source);
            m_TargetProperty.RemoveValueChanged(m_Target, TargetPropertyChanged);
            if (m_Converter != null)
            {
                value = m_Converter.Convert(value, m_TargetProperty.GetType(), null, CultureInfo.CurrentCulture);
            }
            m_TargetProperty.SetValue(m_Target, value);
            m_TargetProperty.AddValueChanged(m_Target, TargetPropertyChanged);
        }

        private void TargetPropertyChanged(object sender, EventArgs e)
        {
            UpdateSource();
        }

        private void UpdateSource()
        {
            object value = m_TargetProperty.GetValue(m_Target);
            m_SourceProperty.RemoveValueChanged(m_Source, SourcePropertyChanged);
            if (m_Converter != null)
            {
                value = m_Converter.ConvertBack(value, m_TargetProperty.GetType(), null, CultureInfo.CurrentCulture);
            }
            m_SourceProperty.SetValue(m_Source, value);
            m_SourceProperty.AddValueChanged(m_Source, SourcePropertyChanged);
        }

        #endregion

    }
}
