import type { VerifiedPrincipal } from "./types";

export function getVerifiedPrincipal(request: Request): VerifiedPrincipal {
  if (process.env.ALLOW_DEMO_IDENTITY === "true") {
    const email = request.headers.get("x-demo-user-email");
    const groups = request.headers.get("x-demo-user-groups");

    if (!email) throw new Error("Demo identity header is missing");

    return {
      subject: `demo:${email}`,
      email,
      groups: groups?.split(",").map((group) => group.trim()).filter(Boolean) ?? [],
    };
  }

  const emailHeader = process.env.VERIFIED_USER_EMAIL_HEADER;
  const subjectHeader = process.env.VERIFIED_USER_SUBJECT_HEADER;
  const groupsHeader = process.env.VERIFIED_USER_GROUPS_HEADER;

  if (!emailHeader || !subjectHeader || !groupsHeader) {
    throw new Error("Verified identity adapter is not configured");
  }

  const email = request.headers.get(emailHeader);
  const subject = request.headers.get(subjectHeader);
  const groups = request.headers.get(groupsHeader);

  if (!email || !subject) throw new Error("Verified identity is missing");

  return {
    subject,
    email,
    groups: groups?.split(",").map((group) => group.trim()).filter(Boolean) ?? [],
  };
}
