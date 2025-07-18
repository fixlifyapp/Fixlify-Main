
import { SimpleMessagesInterface } from "./components/SimpleMessagesInterface";

interface DispatcherMessagesViewProps {
  searchResults?: any[];
}

export const DispatcherMessagesView = ({ searchResults = [] }: DispatcherMessagesViewProps) => {
  console.log('DispatcherMessagesView - using new SimpleMessagesInterface');
  
  return (
    <div className="w-full">
      <SimpleMessagesInterface />
    </div>
  );
};
