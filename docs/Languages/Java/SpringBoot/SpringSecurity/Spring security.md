# Spring security

## 1. Inscription

SecuritySpringConfig.java

```java
@Configuration
@EnableWebSecurity
public class SecuritySpringConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{

		return httpSecurity
			.csrf(AbstractHttpConfigurer::disable)
			.authorizeHttpRequests(
				authorize ->
					authorize.requestMatchers(HttpMethod.POST, "/signin").permitAll()
						.anyRequest().authenticated()
			)
			.build();


	}

}
```

```java
@Configuration
public PasswordService{

@Bean
public BCryptPasswordEncoder passwordEncoder(){
	return new BCryptPasswordEncoder;
}

}
```

to user

```java
BCryptPasswordEncoder passwordEncoder;

passwordEncoder.encode(password)
```

/**\*** ajouter la partie validation de l’email - si l’email est valide ou non **\***/

## 2. Authentification

Pour gérer l’authentification, nous allons utiliser l’authenticationManager qui va permettre à Spring de savoir qui est authentifié.

Pour cela, nous allons créer un nouveau Bean nommé authenticationManager.
Il aura besoin de la configuration par défaut : AuthenticationConfiguration.

```jsx

//Retourne la configuration par défaut grâce à authenticationManager
@Bean
public AuthenticationManager authenticationManager ( AuthenticationConfiguration authenticationConfiguration){

	return authenticationConfiguration.getAuthenticationManager();

}
```

L’authenticationManager s’appui sur un authenticationProvider afin d’accéder à la bdd

Grâce à notre provider, nous allons pouvoir réaliser plusieurs type d’authentication.

Dans notre cas, nous allons utiliser daoAuthentionProvider qui est un implémentation de AuthenticationProvider qui utilise UserDetailsService et PasswordEncoder pour authentifier notre utilisateur.
Nous devrons donc fournir un UserDetailsService à notre provider.

```jsx
@Bean
public authenticationProvider authenticationProvider(UserDetailsService userDetailsService){

	DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
	daoAuthenticationProvider.setUserDetailsService(userDetailsService);
	return daoAuthenticationProvider;

}
```

On va ensuite créer notre UserDetailsService qui contiendra les infos utilisateurs.

```jsx
@Bean UserDetailsService userDetailsService{

	return new UserService()

}
```

Notre service utilisateur doit implémenter UserDetailsService

```jsx
public UserService implements UserDetailsService {}

------------------------------------------------------------

Il faut donc override la fonction loadByUsername de l'interface UserDetailsService

------------------------------------------------------------

@Override
public UserDetails loadByUsername(String email) throws UsernameNotFoundException {

	this.userRepository.
	findByEmail(email).orElseThrow(() -> UsernameNotFoundException('Aucun utilisateur existant'));

}

```

Ensuite nous allons créer un DTO pour récupérer les données de connexion dans notre controller.
Nous aurons besoin du mail et du password

```jsx
public record DTOAuthentication (String email, String password){}
```

On créer notre route dans notre controller en recupérant les infos via notre DTO
Puis on appelle notre authenticationManager pour authentifier notre utilisateur.

```jsx
private AuthenticationManager authenticationManager;

@PostMapping("/login")
public Map<String, String> login(@RequestBody DTOAuthentication DTO){

	authenticationManager.authenticate(

			new UserNamePasswordAuthenticationToken( DTO.email(), DTO.password() )

	);
	return null;
}
```

## 3. Token JWT

Pour sécuriser notre application, nous allons générer un JWT lorsque l’authentification c’est déroulé avec succès.
Nous pourront ainsi transmettre ce JWT dans le header de chaque requête de notre user afin de vérifier l’authentification lors de chaque requête et de manière transparente pour l’utilisateur.

Dependance :

iojsonwebtoken

api

impl

jackson

Créer un Service pour générer notre JWT

nous allons ensuite créer la fonction qui va nous permettre de générer notre JWT

```java
@Service
public class JwtService{

	private final string ENCRYPTION_KEY = ""

	UserService userService;

	public Map<String, String> generate(String email){

		User user = userService.LoadUserByEmail(email);
		return this.generateJwt(user);

	}

	private generateJwt(User user){

		final Map<String, String> claims = Map.of(

		)

		final long currentTime = System.currentTimeMillis();
		final long expirationTime = currentTime + 30 * 60 * 1000;

		final String bearer = Jwts.Builder()
			.setIssuedAt(new Date(currentTime))
			.setExpiration(new date(expirationTime))
			.setSubject(user.getEmail())
			.setClaims(claims)
			.signWith(getKey(), SignatureAlgorithm.HS512)
			.compact();


		return Map.of(
			"bearer", bearer
		);

	}

	private Key getKey(){

		final bytes[] decoder = Decoders.BASE64.decode(ENCRYPTION_KEY);
		return Keys.hmacShaKeyFor(decoder);
	}

}
```

Dans la partie connexion

on va importer notre service JWT et on va faire un controle pour savoir si notre user est authentifier

```java
if(authenticate.isAuthenticate()){

	return this.jwtService.generate(DTO.email)

}
```

Dans la config de securité, ajouter un filtre pour verifier si l’utilisateur est authentifié

```java
@Autowired
JwtFilter jwtFilter;

------------------

.sessionManagement(httpSecuritySessionManagementConfigurer ->
	httpSecuritySessionManagementConfigurer.sessionCreationPolicy.STATELESS) //Dis à spring de ne pas garder l'utilisateur en mémoire et de controler à chaque fois qu'on recoit un JWT
)
.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
.build();

```

Créer notre filtre

```java
public class JwtFilter extends OnePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{

		String token = null;
		String email = null;
		boolean isTokenExpired = true;

		final String authorization = request.getHeader("Authorization");
		if(authorization != null && authorization.startWith("Bearer "){

			token = authorization.substring(7);
			isTokenExpired = jwtService.isTokenExpired(token);
			email = jwtService.extractUsername(token);

		}


		if(!isTokenExpired && username != null && SecurityContextHolder.getContext().getAuthentication() == null){

			UserDetails userDetails = utilisateurService.loadUserByEmail(email);
			UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorization);
			SecurityContextHolder.getContext().setAuthentication(authenticationToken);

		}

		filterChain.doFilter(request, response);

	}

}
```

JWT Service

```java
public boolean isTokenExpired(String token){

	Date expirationDate = this.getClaims(token, Claims::getExpiration);

	return expirationDate.before(new Date());

}

public String extractEmail(String token){

	return this.getClaim(token, Claims::getSubject);

}

private <T> T getClaim(String token, Function<Claims, T> function){

	Claims claim = getAllClaims(token);

	return function.apply(claims)

}

private Claims getAllClaims(String token){

	return Jwts.parseBuilder()
						.setSigningKey(this.getKey())
						.build()
						.parseClaimsJws(token)
						.getBody();

}

```

bcrypt password encoder

1h11

Pour utiliser l’utilisateur connecté :

User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
