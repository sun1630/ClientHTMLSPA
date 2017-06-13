using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Input;
namespace BOCTS.Client.Controls.Authorization
{
    public class DelegateCommand : ICommand
    {
        public delegate void SimpleEventHandler(object sender, DelegateCommandEventArgs e);

        private SimpleEventHandler handler;

        public DelegateCommand(SimpleEventHandler handler)
        {
            this.handler = handler;
        }

        #region ICommand implementation

        /// <summary>
        /// Executing the command is as simple as calling that method 
        /// we were handed on creation.
        /// </summary>
        /// <param name="parameter">Data used by the command. If the 
        /// command does not require data to be passed,
        /// this object can be set to null.</param>
        public void Execute(object parameter)
        {
            this.handler(this, new DelegateCommandEventArgs(parameter));
        }

        /// <summary>
        /// This is the event that WPF's command architecture listens to so 
        /// it knows when to update the UI on command enable/disable.
        /// </summary>
        public event EventHandler CanExecuteChanged;

        #endregion

        #region ICommand 成员

        public bool CanExecute(object parameter)
        {
            return true;
        }

        #endregion
    }

    public class DelegateCommandEventArgs : EventArgs
    {
        private object parameter;

        public DelegateCommandEventArgs(object parameter)
        {
            this.parameter = parameter;
        }

        public object Parameter
        {
            get { return this.parameter; }
        }
    }
}