const patterns = {
  ip: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
};

/*
 * A CIDR contains a valid IP address falled by a range indicator
 * that has an inclusive value between 0 and 32.
 *
 * For example: 127.0.0.1/16
 */
export const isValidCidr = (cidr: string): boolean => {
  let [ip, block] = cidr.split("/");

  const parsedBlock = parseInt(block);

  return (
    ip &&
    parsedBlock &&
    patterns.ip.test(ip) &&
    (parsedBlock >= 0 || parsedBlock <= 32)
  );
};
