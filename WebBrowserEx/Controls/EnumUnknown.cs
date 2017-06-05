using BOC.UOP.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;

namespace BOC.UOP.Controls
{
    internal class EnumUnknown : UnsafeNativeMethods.IEnumUnknown
    {
        private object[] arr;
        private int loc;
        private int size;
        internal EnumUnknown(object[] arr)
        {
            this.arr = arr;
            this.loc = 0;
            this.size = ((arr == null) ? 0 : arr.Length);
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IEnumUnknown.Next(int celt, IntPtr rgelt, IntPtr pceltFetched)
        {
            if (pceltFetched != IntPtr.Zero)
            {
                Marshal.WriteInt32(pceltFetched, 0, 0);
            }
            if (celt < 0)
            {
                return -2147024809;
            }
            int num = 0;
            if (this.loc >= this.size)
            {
                num = 0;
            }
            else
            {
                while (this.loc < this.size && num < celt)
                {
                    if (this.arr[this.loc] != null)
                    {
                        Marshal.WriteIntPtr(rgelt, Marshal.GetIUnknownForObject(this.arr[this.loc]));
                        rgelt = (IntPtr)(((long)rgelt) + Marshal.SizeOf(typeof(IntPtr)));
                        num++;
                    }
                    this.loc++;
                }
            }
            if (pceltFetched != IntPtr.Zero)
            {
                Marshal.WriteInt32(pceltFetched, 0, num);
            }
            if (num != celt)
            {
                return 1;
            }
            return 0;
        }
        [SecurityCritical]
        int UnsafeNativeMethods.IEnumUnknown.Skip(int celt)
        {
            this.loc += celt;
            if (this.loc >= this.size)
            {
                return 1;
            }
            return 0;
        }
        [SecurityCritical]
        void UnsafeNativeMethods.IEnumUnknown.Reset()
        {
            this.loc = 0;
        }
        [SecurityCritical]
        void UnsafeNativeMethods.IEnumUnknown.Clone(out UnsafeNativeMethods.IEnumUnknown ppenum)
        {
            ppenum = new EnumUnknown(this.arr, this.loc);
        }
        private EnumUnknown(object[] arr, int loc)
            : this(arr)
        {
            this.loc = loc;
        }
    }
}
