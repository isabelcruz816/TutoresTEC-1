const express = require('express');
const {User} = require('../models/User');
const {Session} = require('../models/Session');

const router = express.Router();

router.get('/toprated', async (req, res) => {
  const {populated} = req.query;
  let users = await User.find({userType: 1})
    .sort({rating: -1})
    .limit(5);

  if (populated) {
    users = await Promise.all(
      users.map(async user => await user.populateReferences()),
    );
  }

  return res.status(200).json({success: true, users});
});

router.get('/myTutors', async (req, res) => {
  // find user by id
  let user = await User.findById(req.query.id);
  user = await user.populateReferences();

  // find study sessions
  let sessions = user.sessions.filter(session => {
    return session.student === user._id;
  });

  sessions = await Promise.all(
    sessions.map(async session => {
      return await session.populateReferences();
    }),
  );

  // find current sessions
  const current = sessions.filter(session => {
    return session.status === 'pending';
  });

  // find past sessions
  const past = sessions.filter(session => {
    return session.status === 'closed';
  });

  return res.status(200).json({success: true, current, past});
});

router.get('/myStudents', async (req, res) => {
  let user = await User.findById(req.query.id);
  user = await user.populateReferences();

  let sessions = user.sessions.filter(session => {
    return sessions.tutor === user._id;
  });

  sessions = await Promise.all(
    sessions.map(async session => {
      return await sessions.populateReferences();
    }),
  );

  const current = sessions.filter(session => {
    return sessions.status === 'pending';
  });

  return res.status(200).json({success: true, current});
});

router.get('/search', async (req, res) => {
  const {q, populated} = req.query;
  let users = await User.find({name: {$regex: q, $options: 'i'}});

  if (populated) {
    users = await Promise.all(
      users.map(async user => await user.populateReferences()),
    );
  }

  return res.status(200).json({success: true, users});
});

router.post('/becometutor', async (req, res) => {
  const {userID, courseIDs, sessions} = req.body;

  // all are required
  if (userID == null || courseIDs == null || sessions == null) {
    return res.status(401).json({
      success: false,
      message: 'Missing required parameters from body.',
    });
  }

  const user = await User.findById(userID);
  user.userType = 1; // tutor
  courseIDs.forEach(id => user.courses.push(id));

  // create sessions
  for (let session of sessions) {
    const createdSession = await Session.create(session);
    user.sessions.push(createdSession._id);
  }

  // save changes
  await user.save();
  return res
    .status(200)
    .json({success: true, message: 'User has been changed into a tutor.'});
});

module.exports = router;
