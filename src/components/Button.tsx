import React, { MouseEvent } from "react";
import styled from "styled-components";

interface ButtonProps {
  onClick: (event: MouseEvent) => void;
  text: string;
  disabled: boolean;
}

const Button = (props: ButtonProps) => {
  const StyledButton = styled.button`
    background-color: ${props.disabled ? "#c4cfc1" : "#4CAF50"};
    border: none;
    border-radius: 4px;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    margin: 0px;
    font-size: 16px;
    opacity: ${props.disabled ? "0.6" : "1"};
    :hover {
      background-color: ${props.disabled ? "#c4cfc1" : "#5bc146"};
    }
    :focus {
      outline: none;
    }
    :active {
      padding: ${props.disabled ? "10px 20px" : "9px 18px"};
      font-size: ${props.disabled ? "16px" : "14px"};
      margin: ${props.disabled ? "0px" : "1px 4px"};
    }
  `;

  const divStyle = {
    height: "42px",
    marginRight: "5px",
  };

  return (
    <div style={divStyle}>
      <StyledButton onClick={props.onClick} disabled={props.disabled}>
        {props.text}
      </StyledButton>
    </div>
  );
};

export default Button;
