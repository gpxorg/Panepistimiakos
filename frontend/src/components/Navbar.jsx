import { useState } from "react";
import Button from '@mui/material/Button';
import img from '../logo-dark.png';

const Navbar = () => {
    return (
        <nav className='navbar'>
            <div className='content-left'>
                <a href='#' className='test'>
                   test 
                </a>
            </div>
            <div className='content-center'>
                <img className='bar-logo' src={img} href='#' />
            </div>
            <div className='content-right'>
                <Button className='bar-button' variant="outlined">Sign In</Button>
            </div>

        </nav>
    );
};

export default Navbar;

