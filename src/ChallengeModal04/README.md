# Challenge Modal 04

## Challenge A: Validation Errors

Challenge Modal 4 receives a series of values representing Classless Interdomain Routing (CIDR) formatted addresses and a boolean indicator that tells us whether we expect them to be valid. The important thing to remember about CIDR addresses is that they look a lot like IPv4 addresses, only with a CIDR indicator at the end.

So, where an IPv4 address might look like `192.168.2.1`, a CIDR address might look like `192.168.2.1/32`. The value of the range indicator can be between 0 and 32, inclusive.

We run each address through our isValidCIDR function, but the results aren't what we expect. Let's fix that broken function.

## Challenge B: Wrapping Up

Now that the validation function is running as expected, let's close that modal.
