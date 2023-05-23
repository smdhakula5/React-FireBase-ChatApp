import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { Chat } from './components/Chat';
import { Auth } from './components/Auth';
import { AppWrapper } from './components/AppWrapper';



test('renders AppWrapper component', () => {
  render(<AppWrapper />);
  const appHeader = screen.getByText(/Chat App/i);
  expect(appHeader).toBeInTheDocument();
});

test('renders Auth component', () => {
  render(<Auth />);
  const signInText = screen.getByText(/Sign In With Google To Continue/i);
  expect(signInText).toBeInTheDocument();
});

test('renders Chat component', () => {
  render(<Chat room="roomName" />);
  const chatHeader = screen.getByText(/Welcome to: roomName/i);
  expect(chatHeader).toBeInTheDocument();
});

test('renders App component', () => {
  render(<App />);
});




