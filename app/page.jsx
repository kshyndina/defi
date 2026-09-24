import Reader from './components/Reader';
import { getBook } from '../lib/book';

export default function Page() {
  return <Reader book={getBook()} />;
}
