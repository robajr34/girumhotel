export function calculatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: "Empty",
      requirements: [
        { id: "length", text: "At least 8 characters", met: false },
        { id: "uppercase", text: "Uppercase letter", met: false },
        { id: "lowercase", text: "Lowercase letter", met: false },
        { id: "number", text: "Number", met: false },
        { id: "special", text: "Special character", met: false },
      ],
      isStrong: false,
    };
  }

  const requirements = [
    { id: "length", text: "At least 8 characters", met: password.length >= 8 },
    { id: "uppercase", text: "Uppercase letter", met: /[A-Z]/.test(password) },
    { id: "lowercase", text: "Lowercase letter", met: /[a-z]/.test(password) },
    { id: "number", text: "Number", met: /[0-9]/.test(password) },
    { id: "special", text: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = requirements.filter((req) => req.met).length;

  let label = "Empty";
  if (score > 0) label = "Weak";
  if (score >= 3) label = "Fair";
  if (score >= 4) label = "Good";
  if (score === 5) label = "Strong";

  return {
    score,
    label,
    requirements,
    isStrong: score === 5,
  };
}
