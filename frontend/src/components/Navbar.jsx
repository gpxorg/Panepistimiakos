import { useState } from "react";
import Button from '@mui/material/Button';

const Navbar = () => {
    return (
        <nav className='navbar'>
            <div className='content-left'>
                <a href='#' className='bar-logo'>
                    FoititoKosmos
                </a>
            </div>
            <div className='content-center'>
                <ul className='bar-links'>
                    <Button variant='text'>Page 1</Button>
                    <Button variant='text'>Page 2</Button>
                    <Button variant='text'>Page 3</Button>
                </ul>
            </div>
            <div className='content-right'>
                <Button className='bar-button' variant="outlined">Sign In</Button>
            </div>

        </nav>
    );
};

export default Navbar;

