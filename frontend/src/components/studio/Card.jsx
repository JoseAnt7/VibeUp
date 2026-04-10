// components/studio/Card.jsx
import React from "react";

export const Card = ({ children, className = "" }) => {
    return (
        <div className={`studio-card ${className}`}>
            {children}
        </div>
    );
};