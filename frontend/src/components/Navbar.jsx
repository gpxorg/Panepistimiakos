import { useState, useEffect } from 'react';
import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Switch from '@mui/material/Switch';

// icon imports
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';


function ThemeToggler() {
    const [alignment, setAlignment] = React.useState('left');

    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    return (
        <ToggleButtonGroup 
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label='text alignment'
        >
            <ToggleButton value='left' aria-label'left aligned'>
        </ToggleButtonGroup>
    )
}

function BarDrawer() {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const DrawerContent = (
        <Box sx={{ width: 250 }} role='presentation' onClick={toggleDrawer(false)}>
            <List>
                {['ΑΡΧΙΚΗ', 'Ο ΛΟΓΑΡΙΑΣΜΟΣ ΜΟΥ'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <HomeRoundedIcon /> : <AccountCircleRoundedIcon/>}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                        <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <div>
            <Button onClick={toggleDrawer(true)}>Open</Button>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerContent}
            </Drawer>
        </div>
    );
}

const Navbar = () => {
    return (
        <nav className='navbar'>
            <div className='content-left'>
                <BarDrawer />
            </div>
            <div className='content-center'>
                <a href='#'>Panepistimiakos</a>
            </div>
            <div className='content-right'>
                <Button className='bar-button' variant="outlined">Sign In</Button>
            </div>

        </nav>
    );
};

export default Navbar;

