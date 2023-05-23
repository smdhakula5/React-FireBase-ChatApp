import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, TextField, Paper, List, ListItem } from '@mui/material';
import { Auth } from './components/Auth';
import Cookies from 'universal-cookie';
import { Chat } from './components/Chat';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase-config';
import { collection, getDocs, query, where, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const cookies = new Cookies();

const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100vw',
  height: '100vh',
});

const AppContainer = styled(Paper)({
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  padding: '40px',
  position: 'relative',
});

const RoomWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const InputWrapper = styled(Box)({
  marginBottom: '20px',
});

const SignOutButton = styled(Button)({
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#3b5998',
});

const AvailableRoomsWrapper = styled(Box)({
  marginTop: '30px',
  maxHeight: '300px',
  overflowY: 'auto',
});

const RoomListItem = styled(ListItem)({
  marginBottom: '10px',
  fontSize: '18px',
  color: '#3b5998',
  fontWeight: 'bold',
  '&:hover': {
    color: '#2c4488',
    textDecoration: 'underline',
  },
});

export default function App() {
  const [isAuth, setIsAuth] = useState(cookies.get('auth-token'));
  const [room, setRoom] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [userList, setUserList] = useState([]);
  const roomInputRef = useRef(null);
  const [currentScreen, setCurrentScreen] = useState('enter');

  function handleLeaveRoom() {
    setCurrentScreen('enter');
    setRoom(null);
  }

  async function handleSignOut() {
    await signOut(auth);
    cookies.remove('auth-token');
    setIsAuth('false');
    setRoom(null);
  }

  // ...

  async function handlePrivateChat(selectedUser) {
    const currentUser = auth.currentUser.displayName;
    const roomName = [currentUser, selectedUser].sort().join('-');

    // Check if the private chat room already exists
    const privateChatQuery = query(collection(db, 'direct-messages'), where('participants', 'in', [roomName]));
    const privateChatSnapshot = await getDocs(privateChatQuery);

    if (privateChatSnapshot.empty) {
      // If the private chat room doesn't exist, create a new one
      const participants = [currentUser, selectedUser];
      await addDoc(collection(db, 'direct-messages'), { participants });
    }

    // Set the current room to the private chat room
    setRoom(roomName);
    setCurrentScreen('chat');
  }

  // ...

  useEffect(() => {
    async function fetchRooms() {
      try {
        const roomsSnapshot = await getDocs(collection(db, 'messages'));
        const roomNames = new Set();

        roomsSnapshot.forEach((doc) => {
          const roomName = doc.data().room;
          roomNames.add(roomName);
        });

        setRoomList([...roomNames]);

        const unsubscribe = onSnapshot(collection(db, 'messages'), (snapshot) => {
          const updatedRoomList = new Set();

          snapshot.forEach((doc) => {
            const roomName = doc.data().room;
            updatedRoomList.add(roomName);
          });

          setRoomList([...updatedRoomList]);
        });

        return () => unsubscribe();
      } catch (error) {
        console.log('Error fetching rooms:', error);
      }
    }

    async function fetchUsers() {
      try {
        const usersSnapshot = await getDocs(collection(db, 'messages'));
        const users = [];
        const set = new Set();

        usersSnapshot.forEach((doc) => {
          const user = doc.data().user;
          set.add(user);
        });

        const currentUser = auth.currentUser.displayName;
        set.delete(currentUser)
        setUserList([...set]);
      } catch (error) {
        console.log('Error fetching users:', error);
      }
    }

    async function fetchPrivateRooms() {
      try {
        const currentUser = auth.currentUser.displayName;
        const privateRoomsQuery = query(
          collection(db, 'direct-messages'),
          where('participants', 'array-contains', currentUser)
        );
        const privateRoomsSnapshot = await getDocs(privateRoomsQuery);
        const privateRoomNames = [];

        privateRoomsSnapshot.forEach((doc) => {
          const participants = doc.data().participants;
          const otherUser = participants.find((participant) => participant !== currentUser);
          privateRoomNames.push(`${currentUser}-${otherUser}`);
        });

        setRoomList((prevRoomList) => [...prevRoomList, ...privateRoomNames]);
      } catch (error) {
        console.log('Error fetching private rooms:', error);
      }
    }

    async function fetchData() {
      await Promise.all([fetchRooms(), fetchUsers(), fetchPrivateRooms()]);
    }

    fetchData();
  }, []);

  if (!isAuth) {
    return <div><Auth setIsAuth={setIsAuth} /></div>;
  }

  return (
    <Container>
      <AppContainer elevation={3}>
        {currentScreen === 'enter' ? (
          <RoomWrapper>
            <Typography variant="h5" gutterBottom>
              Enter Room Name:
            </Typography>
            <InputWrapper>
              <TextField inputRef={roomInputRef} variant="outlined" size="small" />
            </InputWrapper>
            <Button variant="contained" onClick={() => { setCurrentScreen('chat'); setRoom(roomInputRef.current.value); }}>
              Enter Chat
            </Button>
          </RoomWrapper>
        ) : (
          <>
            <Chat room={room} />
            <Button variant="outlined" onClick={handleLeaveRoom}>Leave Room</Button>
          </>
        )}

        <SignOutButton variant="outlined" onClick={handleSignOut}>Sign Out</SignOutButton>

        <AvailableRoomsWrapper>
          <Typography variant="h6" gutterBottom>
            Available Rooms:
          </Typography>
          <List>
            {roomList.map((roomName) => (
              <RoomListItem key={roomName}>{roomName}</RoomListItem>
            ))}
          </List>
        </AvailableRoomsWrapper>

        <AvailableRoomsWrapper>
          <Typography variant="h6" gutterBottom>
            Available Users:
          </Typography>
          <List>
            {userList.map((user) => (
              <RoomListItem key={user} onClick={() => handlePrivateChat(user)}>
                {user}
              </RoomListItem>
            ))}
          </List>
        </AvailableRoomsWrapper>
      </AppContainer>
    </Container>
  );
}























