using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;

namespace BOC.UOP.Interop
{
    internal abstract class InternalDispatchObject<IDispInterface> : IReflect
    {
        private Dictionary<int, MethodInfo> _dispId2MethodMap;
        Type IReflect.UnderlyingSystemType
        {
            get
            {
                return typeof(IDispInterface);
            }
        }
        [SecurityCritical]
        protected InternalDispatchObject()
        {
            MethodInfo[] methods = typeof(IDispInterface).GetMethods();
            this._dispId2MethodMap = new Dictionary<int, MethodInfo>(methods.Length);
            MethodInfo[] array = methods;
            for (int i = 0; i < array.Length; i++)
            {
                MethodInfo methodInfo = array[i];
                int value = ((DispIdAttribute[])methodInfo.GetCustomAttributes(typeof(DispIdAttribute), false))[0].Value;
                this._dispId2MethodMap[value] = methodInfo;
            }
        }
        FieldInfo IReflect.GetField(string name, BindingFlags bindingAttr)
        {
            throw new NotImplementedException();
        }
        FieldInfo[] IReflect.GetFields(BindingFlags bindingAttr)
        {
            return null;
        }
        MemberInfo[] IReflect.GetMember(string name, BindingFlags bindingAttr)
        {
            throw new NotImplementedException();
        }
        MemberInfo[] IReflect.GetMembers(BindingFlags bindingAttr)
        {
            throw new NotImplementedException();
        }
        MethodInfo IReflect.GetMethod(string name, BindingFlags bindingAttr)
        {
            throw new NotImplementedException();
        }
        MethodInfo IReflect.GetMethod(string name, BindingFlags bindingAttr, Binder binder, Type[] types, ParameterModifier[] modifiers)
        {
            throw new NotImplementedException();
        }
        MethodInfo[] IReflect.GetMethods(BindingFlags bindingAttr)
        {
            return null;
        }
        PropertyInfo[] IReflect.GetProperties(BindingFlags bindingAttr)
        {
            return null;
        }
        PropertyInfo IReflect.GetProperty(string name, BindingFlags bindingAttr, Binder binder, Type returnType, Type[] types, ParameterModifier[] modifiers)
        {
            throw new NotImplementedException();
        }
        PropertyInfo IReflect.GetProperty(string name, BindingFlags bindingAttr)
        {
            throw new NotImplementedException();
        }
        object IReflect.InvokeMember(string name, BindingFlags invokeAttr, Binder binder, object target, object[] args, ParameterModifier[] modifiers, CultureInfo culture, string[] namedParameters)
        {
            if (name.StartsWith("[DISPID=", StringComparison.OrdinalIgnoreCase))
            {
                int key = int.Parse(name.Substring(8, name.Length - 9), CultureInfo.InvariantCulture);
                MethodInfo methodInfo;
                if (this._dispId2MethodMap.TryGetValue(key, out methodInfo))
                {
                    return methodInfo.Invoke(this, invokeAttr, binder, args, culture);
                }
            }
            throw new MissingMethodException(base.GetType().Name, name);
        }
    }
}
