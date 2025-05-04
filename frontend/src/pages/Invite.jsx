import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Invite() {
  const { token } = useParams();
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8000/invite/${token}`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        // optionally redirect to trip page
      });
  }, [token]);

  return <div>{message || "Joining trip..."}</div>;
}

export default Invite;
