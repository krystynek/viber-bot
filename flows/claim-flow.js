const callUs = 'Sorry it seems like we could not confirm your identity. Please try again.\n (You can type "edit" to change your answers or "reset" to start again. Alternatively, you can call us at our number 0800 000 000)'


const flow = [
  {
    step: 0,
    column: 'name',
    field: '[0] Full name',
    description: 'Verify name',
    question: 'Please enter your full name.',
    validation: 'db.name',
    success: 'Thank you %s.?',
    error: callUs,
    action: null,
  },
  {
    step: 1,
    column: 'dob',
    field: '[1] Date of birth',
    description: 'Verify Date of Birth',
    question: 'Please enter your date of birth in DD/MM/YYYY format.',
    validation: 'db.dob',
    success: 'Thank you.',
    error: callUs,
    action: null,
  },
  {
    step: 2,
    column: 'zip',
    field: '[2] Post code ',
    description: 'Verify Post code',
    question: 'What is your post code?',
    validation: 'db.zip',
    success: 'Thank you.',
    error: callUs,
    action: null,
  },
  {
    step: 3,
    column: 'street',
    field: '[3] Street ',
    description: 'Verify Street',
    question: 'On what street do you live?',
    validation: 'db.',
    success: 'Thank you.',
    error: callUs,
    action: null,
  },
]

module.exports = flow