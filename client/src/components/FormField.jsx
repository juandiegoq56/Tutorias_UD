const FormField = ({ label, children, tooltip }) => {
    return (
      <div className="form-group">
        <div className="label-container">
          <label>{label}</label>
          {tooltip && (
            <div className="tooltip-container">
              <span className="tooltip-trigger">?</span>
              <div className="tooltip-content">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {children}
      </div>
    );
  };
  export default FormField;