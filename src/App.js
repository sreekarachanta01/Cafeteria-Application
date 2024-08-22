import React, { useEffect, useState, useRef } from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  Container,
  Grid,
  Paper,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { Add, Remove, Edit, Delete } from '@mui/icons-material';
import Slider from 'react-slick';

const App = () => {
  const [users, setUsers] = useState([]);
  const [lunchItems, setLunchItems] = useState([]);
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [summary, setSummary] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newItem, setNewItem] = useState({
    itemName: '',
    cost: '',
    mealType: 'Lunch',
  });

  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const sliderRef = useRef(null);
  const [jsonUserInput, setJsonUserInput] = useState('');
  const [jsonItemInput, setJsonItemInput] = useState('');

  const handleAddItemsFromJson = () => {
    try {
      const itemList = JSON.parse(jsonItemInput);
      if (Array.isArray(itemList)) {
        const updatedLunchItems = [];
        const updatedBreakfastItems = [];
        itemList.forEach(item => {
          if (item.mealType === 'Lunch') {
            updatedLunchItems.push({ itemName: item.itemName, cost: parseFloat(item.cost) });
          } else if (item.mealType === 'Breakfast') {
            updatedBreakfastItems.push({ itemName: item.itemName, cost: parseFloat(item.cost) });
          }
        });
        setLunchItems([...lunchItems, ...updatedLunchItems]);
        setBreakfastItems([...breakfastItems, ...updatedBreakfastItems]);
        localStorage.setItem('lunchMenu', JSON.stringify([...lunchItems, ...updatedLunchItems]));
        localStorage.setItem('breakfastMenu', JSON.stringify([...breakfastItems, ...updatedBreakfastItems]));
        setJsonItemInput('');
        setItemDialogOpen(false);
      } else {
        alert('Invalid JSON format for items.');
      }
    } catch (e) {
      alert('Invalid JSON format.');
    }
  };
  
  const handleAddUsersFromJson = () => {
    try {
      const userList = JSON.parse(jsonUserInput);
      if (Array.isArray(userList) && userList.every(user => user.name)) {
        const updatedUsers = [...users, ...userList.map(user => ({ name: user.name }))];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setJsonUserInput('');
        setUserDialogOpen(false);
      } else {
        alert('Invalid JSON format for users. Each user should be an object with a "name" property.');
      }
    } catch (e) {
      alert('Invalid JSON format.');
    }
  };
  

  useEffect(() => {
    const initializeLocalStorage = () => {
      const initialData = {
        breakfastMenu: [
          { itemName: 'Idly', cost: 30 },
          { itemName: 'Dosa', cost: 40 },
          { itemName: 'Vada', cost: 50 },
          { itemName: 'Bonda', cost: 60 },
          { itemName: 'Upma', cost: 30 },
          { itemName: 'Poha', cost: 45 },
          { itemName: 'Chai', cost: 12 },
        ],
        lunchMenu: [
          { itemName: 'Veg Fried Rice', cost: 50 },
          { itemName: 'Egg Fried Rice', cost: 55 },
          { itemName: 'Chicken Fried Rice', cost: 60 },
          { itemName: 'Veg Thali', cost: 120 },
          { itemName: 'Chicken Thali', cost: 140 },
          { itemName: 'Roti', cost: 10 },
          { itemName: 'Butter Chicken', cost: 150 },
        ],
        users: [
          { name: 'Vijay' },
          { name: 'Ankush' },
          { name: 'Vivek' },
          { name: 'Sachin' },
          { name: 'Lasya' },
          { name: 'Raghavendra' },
        ],
      };

      if (!localStorage.getItem('breakfastMenu')) {
        localStorage.setItem(
          'breakfastMenu',
          JSON.stringify(initialData.breakfastMenu)
        );
      }
      if (!localStorage.getItem('lunchMenu')) {
        localStorage.setItem(
          'lunchMenu',
          JSON.stringify(initialData.lunchMenu)
        );
      }
      if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(initialData.users));
      }
    };

    initializeLocalStorage();

    setUsers(JSON.parse(localStorage.getItem('users')));
    setBreakfastItems(JSON.parse(localStorage.getItem('breakfastMenu')));
    setLunchItems(JSON.parse(localStorage.getItem('lunchMenu')));
    setSummary(JSON.parse(localStorage.getItem('summary')) || []);
  }, []);

  const handleUserSelect = (user) => {
    const isSelected = selectedUsers.includes(user);
    const existingEntry = summary.find((order) => order.user === user);

    if (isSelected) {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((u) => u !== user)
      );
      if (selectedUsers.length === 1) {
        setSelectedItems([]);
      }
    } else {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
      setSelectedItems(existingEntry ? existingEntry.items : []);
    }
  };

  const handleItemSelect = (item) => {
    const existingItem = selectedItems.find(
      (i) => i.itemName === item.itemName
    );
    if (existingItem) {
      setSelectedItems(
        selectedItems.filter((i) => i.itemName !== item.itemName)
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (item, amount) => {
    const updatedItems = selectedItems
      .map((i) => {
        if (i.itemName === item.itemName) {
          const newQuantity = i.quantity + amount;
          if (newQuantity > 0) {
            return { ...i, quantity: newQuantity };
          } else {
            return null;
          }
        }
        return i;
      })
      .filter((i) => i !== null);

    setSelectedItems(updatedItems);
  };

  const handleConfirm = () => {
    if (selectedUsers.length > 0 && selectedItems.length > 0) {
      const newEntries = selectedUsers.map((user) => ({
        user,
        items: selectedItems,
        totalCost: selectedItems.reduce(
          (acc, item) => acc + item.cost * item.quantity,
          0
        ),
      }));

      const updatedSummary = summary.filter(
        (order) => !selectedUsers.includes(order.user)
      );
      const newSummary = [...updatedSummary, ...newEntries];
      localStorage.setItem('summary', JSON.stringify(newSummary));

      setSummary(newSummary);
      setSelectedUsers([]);
      setSelectedItems([]);

      if (sliderRef.current) {
        sliderRef.current.slickGoTo(0);
      }
    }
  };

  const handleEdit = (user) => {
    const existingEntry = summary.find((order) => order.user === user);
    if (existingEntry) {
      setSelectedUsers([user]);
      setSelectedItems(existingEntry.items);
      // Go to the summary slide if on a slider view
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(2); // Adjust index based on your slider configuration
      }
    }
  };
  

  const handleDelete = (user) => {
    const updatedSummary = summary.filter((order) => order.user !== user);
    localStorage.setItem('summary', JSON.stringify(updatedSummary));

    setSummary(updatedSummary);
    if (selectedUsers.includes(user)) {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((u) => u !== user)
      );
      if (selectedUsers.length === 1) {
        setSelectedItems([]);
      }
    }
  };

  const addUser = () => {
    if (newUserName.trim()) {
      const updatedUsers = [...users, { name: newUserName }];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setNewUserName('');
      setUserDialogOpen(false);
    }
  };

  const addItem = () => {
    if (newItem.itemName.trim() && newItem.cost && newItem.mealType) {
      const updatedItems =
        newItem.mealType === 'Lunch'
          ? [
            ...lunchItems,
            { itemName: newItem.itemName, cost: parseFloat(newItem.cost) },
          ]
          : [
            ...breakfastItems,
            { itemName: newItem.itemName, cost: parseFloat(newItem.cost) },
          ];

      if (newItem.mealType === 'Lunch') {
        setLunchItems(updatedItems);
        localStorage.setItem('lunchMenu', JSON.stringify(updatedItems));
      } else {
        setBreakfastItems(updatedItems);
        localStorage.setItem('breakfastMenu', JSON.stringify(updatedItems));
      }

      setNewItem({ itemName: '', cost: '', mealType: 'Lunch' });
      setItemDialogOpen(false);
    }
  };

  const totalUsers = summary.length;
  const totalItemsOrdered = summary.reduce(
    (acc, entry) =>
      acc + entry.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const totalOrderValue = summary.reduce(
    (acc, entry) => acc + entry.totalCost,
    0
  );

  const getUserStatusColor = (user) => {
    return summary.some((entry) => entry.user === user) ? 'green' : 'gray';
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  const isBreakfastTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 4 && hour < 11.5; // Adjust for your time range
  };

  const displayBreakfastOnTop = isBreakfastTime();

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center">
        Cafeteria App
      </Typography>
      {isSmallScreen ? (
        <Slider {...sliderSettings} ref={sliderRef}>
          <div>
            <Grid item xs={12} sm={3}>
              <Paper
                elevation={3}
                style={{
                  height: '60vh',
                  overflowY: 'scroll',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h6" gutterBottom textAlign='center'>
                  Users
                </Typography>
                <List>
                  {users.map((user) => (
                    <ListItem key={user.name} button onClick={() => handleUserSelect(user.name)}>
                      <Checkbox
                        checked={selectedUsers.includes(user.name)}
                        style={{ color: getUserStatusColor(user.name) }}
                      />
                      <ListItemText primary={user.name} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setUserDialogOpen(true)}
                  startIcon={<Add />}
                  style={{ marginTop: 'auto', width: '100%' }}
                >
                  Add User
                </Button>
              </Paper>
            </Grid>
          </div>
          <div>
            <Grid item xs={12} sm={6}>
            <Paper
                elevation={3}
                style={{
                  height: '60vh',
                  overflowY: 'scroll',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h6" gutterBottom textAlign='center'>
                  {displayBreakfastOnTop ? 'Breakfast Menu' : 'Lunch Menu'}
                </Typography>
                <List>
                  {displayBreakfastOnTop && breakfastItems.map((item) => (
                    <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                      <Checkbox
                        checked={selectedItems.some((i) => i.itemName === item.itemName)}
                      />
                      <ListItemText
                        primary={item.itemName}
                        secondary={`Cost: ₹${item.cost}`}
                      />
                    </ListItem>
                  ))}
                  {!displayBreakfastOnTop && lunchItems.map((item) => (
                    <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                      <Checkbox
                        checked={selectedItems.some((i) => i.itemName === item.itemName)}
                      />
                      <ListItemText
                        primary={item.itemName}
                        secondary={`Cost: ₹${item.cost}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="h6" gutterBottom textAlign='center'>
                  {displayBreakfastOnTop ? 'Lunch Menu' : 'Breakfast Menu'}
                </Typography>
                <List>
                  {!displayBreakfastOnTop && breakfastItems.map((item) => (
                    <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                      <Checkbox
                        checked={selectedItems.some((i) => i.itemName === item.itemName)}
                      />
                      <ListItemText
                        primary={item.itemName}
                        secondary={`Cost: ₹${item.cost}`}
                      />
                    </ListItem>
                  ))}
                  {displayBreakfastOnTop && lunchItems.map((item) => (
                    <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                      <Checkbox
                        checked={selectedItems.some((i) => i.itemName === item.itemName)}
                      />
                      <ListItemText
                        primary={item.itemName}
                        secondary={`Cost: ₹${item.cost}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setItemDialogOpen(true)}
                  startIcon={<Add />}
                  style={{ marginTop: 'auto', width: '100%' }}
                >
                  Add Item
                </Button>
              </Paper>
            </Grid>
          </div>
          <div>
            <Grid item xs={12} sm={3}>
              <Paper elevation={3} style={{
                height: '60vh',
                overflowY: 'scroll',
                display: 'flex',
                flexDirection: 'column', 
              }}>
                <Typography variant="h6" gutterBottom sx={{padding: '8px 16px'}}>
                  Summary
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0',padding: '8px 16px' }}>
                  Users: {selectedUsers.join(', ')}
                </Typography>
                <List>
                  {selectedItems.map((item) => (
                    <ListItem key={item.itemName} sx={{padding: '8px 16px'}}>
                      <ListItemText
                        primary={`${item.itemName}`}
                        secondary={`Cost: ₹${item.cost * item.quantity}`}
                      />
                      <IconButton
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        <Remove />
                        <ListItemText
                          primary={`${item.quantity}`}
                        />
                      </IconButton>
                      <IconButton
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <Add />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                {selectedItems.length > 0 && (
                  <Typography
                    variant="subtitle1"
                    style={{ marginTop: '10px',padding: '8px 16px' }}
                  >
                    Total: ₹
                    {selectedItems.reduce(
                      (acc, item) => acc + item.cost * item.quantity,
                      0
                    )}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirm}
                  style={{ marginTop: 'auto',width:'100%' }}
                >
                  Confirm
                </Button>
              </Paper>
            </Grid>
          </div>
          <div>
            <Grid item xs={12} sm={3}>
              <Paper elevation={3} style={{
                height: '60vh',
                overflowY: 'scroll',
                display: 'flex',
                flexDirection: 'column', padding: '16px'
              }}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0' }}>
                  Users: {selectedUsers.join(', ')}
                </Typography>
                <List>
                  {selectedItems.map((item) => (
                    <ListItem key={item.itemName}>
                      <ListItemText
                        primary={`${item.itemName}`}
                        secondary={`Cost: ₹${item.cost * item.quantity}`}
                      />
                      <IconButton
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        <Remove />
                        <ListItemText
                          primary={`${item.quantity}`}
                        />
                      </IconButton>
                      <IconButton
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <Add />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                {selectedItems.length > 0 && (
                  <Typography
                    variant="subtitle1"
                    style={{ marginTop: '10px' }}
                  >
                    Total: ₹
                    {selectedItems.reduce(
                      (acc, item) => acc + item.cost * item.quantity,
                      0
                    )}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirm}
                  style={{ marginTop: 'auto' }}
                >
                  Confirm
                </Button>
              </Paper>
            </Grid>
          </div>
        </Slider>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Paper elevation={3} style={{ height: '60vh', overflowY: 'scroll' }}>
              <Typography variant="h6" gutterBottom textAlign='center'>
                Users
              </Typography>
              <List>
                {users.map((user) => (
                  <ListItem key={user.name} button onClick={() => handleUserSelect(user.name)}>
                    <Checkbox
                      checked={selectedUsers.includes(user.name)}
                      style={{ color: getUserStatusColor(user.name) }}
                    />
                    <ListItemText primary={user.name} />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setUserDialogOpen(true)}
                startIcon={<Add />}
                style={{ marginTop: 'auto', width: '100%' }}
              >
                Add User
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
          <Paper elevation={3} style={{ height: '60vh', overflowY: 'scroll' }}>
              <Typography variant="h6" gutterBottom textAlign='center'>
                {displayBreakfastOnTop ? 'Breakfast Menu' : 'Lunch Menu'}
              </Typography>
              <List>
                {displayBreakfastOnTop && breakfastItems.map((item) => (
                  <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                    <Checkbox
                      checked={selectedItems.some((i) => i.itemName === item.itemName)}
                    />
                    <ListItemText
                      primary={item.itemName}
                      secondary={`Cost: ₹${item.cost}`}
                    />
                  </ListItem>
                ))}
                {!displayBreakfastOnTop && lunchItems.map((item) => (
                  <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                    <Checkbox
                      checked={selectedItems.some((i) => i.itemName === item.itemName)}
                    />
                    <ListItemText
                      primary={item.itemName}
                      secondary={`Cost: ₹${item.cost}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" gutterBottom textAlign='center'>
                {displayBreakfastOnTop ? 'Lunch Menu' : 'Breakfast Menu'}
              </Typography>
              <List>
                {!displayBreakfastOnTop && breakfastItems.map((item) => (
                  <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                    <Checkbox
                      checked={selectedItems.some((i) => i.itemName === item.itemName)}
                    />
                    <ListItemText
                      primary={item.itemName}
                      secondary={`Cost: ₹${item.cost}`}
                    />
                  </ListItem>
                ))}
                {displayBreakfastOnTop && lunchItems.map((item) => (
                  <ListItem key={item.itemName} button onClick={() => handleItemSelect(item)}>
                    <Checkbox
                      checked={selectedItems.some((i) => i.itemName === item.itemName)}
                    />
                    <ListItemText
                      primary={item.itemName}
                      secondary={`Cost: ₹${item.cost}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setItemDialogOpen(true)}
                startIcon={<Add />}
                style={{ marginTop: 'auto', width: '100%' }}
              >
                Add Item
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
          <Paper elevation={3} style={{
                height: '60vh',
                overflowY: 'scroll',
                display: 'flex',
                flexDirection: 'column', 
              }}>
                <Typography variant="h6" gutterBottom sx={{padding: '8px 16px'}}>
                  Summary
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0',padding: '8px 16px' }}>
                  Users: {selectedUsers.join(', ')}
                </Typography>
                <List>
                  {selectedItems.map((item) => (
                    <ListItem key={item.itemName} sx={{padding: '8px 16px'}}>
                      <ListItemText
                        primary={`${item.itemName}`}
                        secondary={`Cost: ₹${item.cost * item.quantity}`}
                      />
                      <IconButton
                        onClick={() => handleQuantityChange(item, -1)}
                      >
                        <Remove />
                        <ListItemText
                          primary={`${item.quantity}`}
                        />
                      </IconButton>
                      <IconButton
                        onClick={() => handleQuantityChange(item, 1)}
                      >
                        <Add />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                {selectedItems.length > 0 && (
                  <Typography
                    variant="subtitle1"
                    style={{ marginTop: '10px',padding: '8px 16px' }}
                  >
                    Total: ₹
                    {selectedItems.reduce(
                      (acc, item) => acc + item.cost * item.quantity,
                      0
                    )}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirm}
                  style={{ marginTop: 'auto',width:'100%' }}
                >
                  Confirm
                </Button>
              </Paper>
          </Grid>
        </Grid>
      )}
      <Grid item xs={12}>
        <TableContainer
          component={Paper}
          elevation={3}
          style={{ marginTop: '20px', padding: 0 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '30%' }}>User</TableCell>
                <TableCell style={{ width: '40%' }}>Items</TableCell>
                <TableCell style={{ width: '15%' }}>Total Cost</TableCell>
                <TableCell style={{ width: '15%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>
                    {entry.items.map((i) => (
                      <div key={i.itemName}>
                        {i.itemName} x {i.quantity}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>₹{entry.totalCost}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(entry.user)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(entry.user)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={1} style={{ fontWeight: 'bold' }}>
                  Total Users: {totalUsers}
                </TableCell>
                <TableCell colSpan={1} style={{ fontWeight: 'bold' }}>
                  Total Items Ordered: {totalItemsOrdered}
                </TableCell>
                <TableCell colSpan={2} style={{ fontWeight: 'bold' }}>
                  Total Order Value: ₹{totalOrderValue}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
  <DialogTitle>Add User</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="User Name"
      type="text"
      fullWidth
      value={newUserName}
      onChange={(e) => setNewUserName(e.target.value)}
    />
    <TextField
      margin="dense"
      label='JSON Input (e.g., [{\"name\": \"John\"}, {\"name\": \"Jane\"}])'
      type="text"
      multiline
      rows={4}
      fullWidth
      value={jsonUserInput}
      onChange={(e) => setJsonUserInput(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setUserDialogOpen(false)} color="primary">
      Cancel
    </Button>
    <Button onClick={handleAddUsersFromJson} color="primary">
      Add Users
    </Button>
    <Button onClick={addUser} color="primary">
      Add User
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)}>
  <DialogTitle>Add Item</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Item Name"
      type="text"
      fullWidth
      value={newItem.itemName}
      onChange={(e) =>
        setNewItem({ ...newItem, itemName: e.target.value })
      }
    />
    <TextField
      margin="dense"
      label="Cost"
      type="number"
      fullWidth
      value={newItem.cost}
      onChange={(e) =>
        setNewItem({ ...newItem, cost: e.target.value })
      }
    />
    <TextField
      margin="dense"
      label="Meal Type"
      select
      fullWidth
      value={newItem.mealType}
      onChange={(e) =>
        setNewItem({ ...newItem, mealType: e.target.value })
      }
      SelectProps={{
        native: true,
      }}
    >
      <option value="Lunch">Lunch</option>
      <option value="Breakfast">Breakfast</option>
    </TextField>
    <TextField
      margin="dense"
      label='JSON Input (e.g., [{\"itemName\": \"Burger\", \"cost\": 50, \"mealType\": \"Lunch\"}])'
      type="text"
      multiline
      rows={4}
      fullWidth
      value={jsonItemInput}
      onChange={(e) => setJsonItemInput(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setItemDialogOpen(false)} color="primary">
      Cancel
    </Button>
    <Button onClick={handleAddItemsFromJson} color="primary">
      Add Items
    </Button>
    <Button onClick={addItem} color="primary">
      Add Item
    </Button>
  </DialogActions>
</Dialog>
    </Container>
  );
};

export default App;