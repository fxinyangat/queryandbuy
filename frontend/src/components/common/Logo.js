import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ src, tagline, isCollapsed }) => (
    <div className="logo-container">
        <img src={src} alt="ShopQnB" className="logo" />
        {tagline && <p className="tagline">{tagline}</p>}
    </div>
);

Logo.propTypes = {
    src: PropTypes.string.isRequired,
    tagline: PropTypes.string,
    isCollapsed: PropTypes.bool
};

export default Logo; 