import * as React from 'react';
import {Card, Nav, Form, Button} from 'react-bootstrap';
import {useState, useEffect} from 'react';
import TutorSearchRow from '../components/TutorSearchRow';
import {SERVER_URL} from '../config';

function SearchView() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [topTutors, setTopTutors] = useState([]);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetchTopTutors() {
      const response = await fetch(
        `${SERVER_URL}/api/users/toprated?populated=true`,
        {
          method: 'GET',
        },
      );

      const json = await response.json();
      setTopTutors(json.users);
    }

    fetchTopTutors();
  }, []);

  const onNavClick = index => {
    setSelectedIndex(index);
  };

  const onInputChange = e => {
    if (query === '') {
      setResults([]);
    }
    setQuery(e.target.value);
  };

  const onFormSubmit = async e => {
    e.preventDefault();
    if (!query) {
      return;
    }

    const response = await fetch(
      `${SERVER_URL}/api/users/search?q=${query}&populated=true`,
      {
        method: 'GET',
      },
    );
    const json = await response.json();
    if (json.users.length === 0) {
      alert('No results!');
      return;
    }

    if (selectedIndex === 0) {
      // tutors
      setResults(json.users);
    } else {
      // courses
    }
  };

  return (
    <div style={styles.root}>
      <h3 style={styles.title}>Search</h3>
      <Card>
        <Card.Header>
          <Nav variant="tabs" defaultActiveKey="Tutors">
            <Nav.Item onClick={() => onNavClick(0)}>
              <Nav.Link eventKey="Tutors">Tutors</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          <Form
            style={{display: 'flex', flexDirection: 'row'}}
            onSubmit={onFormSubmit}
          >
            {selectedIndex === 0 ? (
              <Form.Control
                type="text"
                placeholder="Search for author name..."
                onChange={onInputChange}
              />
            ) : (
              <Form.Control
                type="text"
                placeholder="Search for courses..."
                onChange={onInputChange}
              />
            )}
            <Button type="submit" style={{marginLeft: '8px'}}>
              Search
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <h5 style={styles.subtitle}>Top-rated Tutors</h5>
      {results.length === 0
        ? selectedIndex === 0 &&
          topTutors.map(tutor => (
            <TutorSearchRow key={tutor._id} tutor={tutor} />
          ))
        : query === '' &&
          selectedIndex === 0 &&
          topTutors.map(tutor => (
            <TutorSearchRow key={tutor._id} tutor={tutor} />
          ))}
      {selectedIndex === 0 &&
        results.map(tutor => <TutorSearchRow key={tutor._id} tutor={tutor} />)}
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    padding: '10px',
    flexDirection: 'column',
    width: '100%',
  },
  title: {
    fontWeight: 200,
  },
  subtitle: {
    marginTop: '12px',
  },
};

export default SearchView;
