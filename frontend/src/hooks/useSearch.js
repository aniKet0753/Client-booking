import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const search = (searchTerm = query) => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setQuery("");
      return true;
    }
    return false;
  };

  return { query, setQuery, search };
};