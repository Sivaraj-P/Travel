import PropTypes from 'prop-types';

const Dropdown = ({ name, value, options, onChange, placeholder, loading }) => (
    <select name={name} value={value} className="w-full p-2 border rounded" onChange={onChange}>
      <option value="">{loading ? "Loading..." : placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
      </select>
  );
  
  Dropdown.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    loading: PropTypes.bool
  };
  
  export default Dropdown;
  
  
  