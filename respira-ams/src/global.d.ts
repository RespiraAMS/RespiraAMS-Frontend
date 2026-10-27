import vi from './messages/vi.json';

type Messages = typeof vi;

declare global {
  type IntlMessages = Messages
}