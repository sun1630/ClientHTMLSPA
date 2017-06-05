using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;
using System.Threading;

namespace BOC.UOP.Win32
{
    internal static class HandleCollector
    {
        private class HandleType
        {
            internal readonly string name;
            private int initialThreshHold;
            private int threshHold;
            private int handleCount;
            private readonly int deltaPercent;
            internal HandleType(string name, int expense, int initialThreshHold)
            {
                this.name = name;
                this.initialThreshHold = initialThreshHold;
                this.threshHold = initialThreshHold;
                this.deltaPercent = 100 - expense;
            }
            internal void Add()
            {
                bool flag = false;
                bool flag2 = false;
                try
                {
                    Monitor.Enter(this, ref flag2);
                    this.handleCount++;
                    flag = this.NeedCollection();
                    if (!flag)
                    {
                        return;
                    }
                }
                finally
                {
                    if (flag2)
                    {
                        Monitor.Exit(this);
                    }
                }
                if (flag)
                {
                    GC.Collect();
                    int millisecondsTimeout = (100 - this.deltaPercent) / 4;
                    Thread.Sleep(millisecondsTimeout);
                }
            }
            internal bool NeedCollection()
            {
                if (this.handleCount > this.threshHold)
                {
                    this.threshHold = this.handleCount + this.handleCount * this.deltaPercent / 100;
                    return true;
                }
                int num = 100 * this.threshHold / (100 + this.deltaPercent);
                if (num >= this.initialThreshHold && this.handleCount < (int)((float)num * 0.9f))
                {
                    this.threshHold = num;
                }
                return false;
            }
            internal void Remove()
            {
                bool flag = false;
                try
                {
                    Monitor.Enter(this, ref flag);
                    this.handleCount--;
                    this.handleCount = Math.Max(0, this.handleCount);
                }
                finally
                {
                    if (flag)
                    {
                        Monitor.Exit(this);
                    }
                }
            }
        }
        private static HandleCollector.HandleType[] handleTypes;
        private static int handleTypeCount = 0;
        private static object handleMutex = new object();
        internal static IntPtr Add(IntPtr handle, int type)
        {
            HandleCollector.handleTypes[type - 1].Add();
            return handle;
        }
        [SecuritySafeCritical]
        internal static SafeHandle Add(SafeHandle handle, int type)
        {
            HandleCollector.handleTypes[type - 1].Add();
            return handle;
        }
        internal static void Add(int type)
        {
            HandleCollector.handleTypes[type - 1].Add();
        }
        internal static int RegisterType(string typeName, int expense, int initialThreshold)
        {
            int result;
            lock (HandleCollector.handleMutex)
            {
                if (HandleCollector.handleTypeCount == 0 || HandleCollector.handleTypeCount == HandleCollector.handleTypes.Length)
                {
                    HandleCollector.HandleType[] destinationArray = new HandleCollector.HandleType[HandleCollector.handleTypeCount + 10];
                    if (HandleCollector.handleTypes != null)
                    {
                        Array.Copy(HandleCollector.handleTypes, 0, destinationArray, 0, HandleCollector.handleTypeCount);
                    }
                    HandleCollector.handleTypes = destinationArray;
                }
                HandleCollector.handleTypes[HandleCollector.handleTypeCount++] = new HandleCollector.HandleType(typeName, expense, initialThreshold);
                result = HandleCollector.handleTypeCount;
            }
            return result;
        }
        internal static IntPtr Remove(IntPtr handle, int type)
        {
            HandleCollector.handleTypes[type - 1].Remove();
            return handle;
        }
        [SecuritySafeCritical]
        internal static SafeHandle Remove(SafeHandle handle, int type)
        {
            HandleCollector.handleTypes[type - 1].Remove();
            return handle;
        }
        internal static void Remove(int type)
        {
            HandleCollector.handleTypes[type - 1].Remove();
        }
    }
}
