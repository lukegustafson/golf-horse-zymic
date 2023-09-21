//r holds the compressed data. Actual submission uses unescaped Unicode.
r=`\x80\x1b\u0703N\x06kE\x80\x80\x83K\u03c8>K0\xbd\f\xa3,\x15&\u0639C\x81G\t\x05@8'=\t\x14Wg\x80\u02e0Yf\x80\x8d_\u05d4d\x82#\u0370gc@\nX\u03bdnK]\0!\x01950c%+Pt6V\0@a*8pK\x17M\"-\x12U\x19X]?q\x16G\"\"2B\u02c3\u07c2nI\x16=_!mc\u0530\b\x11\u0585+\x1d6a?\x80;DD6kRd\x9b\x12jo\x80`;

C=`charCodeAt`;

/*
e: compressed data as an array of numbers.
h: high value for the active interval in the arithmetic decoder
i: current index into e. Note that the first element of e is unused because i starts at 1--this is a golf trick to save bytes. Compare:
   e=[h=i=1];
   vs
   e=[];h=1;i=0;
*/
e=[h=i=1];

/*
Here we convert the compressed data, r, to an array of numbers, e
*/
for(x of r)
{
	/*
	Get the current character code, and do an early initialization of m and c.
	m: length of current word being built
	c: current value in the arithmetic decoder
	*/
	a=x[C](m=c=0)-124;
	
	//Skip characters that can't occur in a template literal
	for(z of `#[_`)
		a-=x>z;
	
	//Convert our character to one or two numeric values. Append to e
	e.push(...a<0?[a+138]:[a/138|0,a%138])
};

/*
Main Function
r: Overrides old r. The main function *and* lookup into our context models.
   We are taking advantage that functions are objects in JavaScript; we save an object initialization by re-using r thus.
p: current word being built
f: current letter as number. We use base-36 to represent the letter, as "f.toString(36)" is shorter than anything using fromCharCode
k: current letter as string
M: number of true bits seen so far (capped at 2)
t: threshhold for a true bit in the arithmetic decoder
*/
r=p=>{
	for(
		var M=0,f=9;
		++f<36;
		//Here we have a mix of arithmetic decoder logic ("h=t" and "c-=t") and the recursion of the main function
		(c<t)?h=t:((M+=M<2,c-=t,m<5)?r:console.log)(p+k),m--
	)
		/*
		t: accumulator for numerator of context mixing formula (collides with arithmetic decoder's t, but it's okay)
		u: accumulator for denominator of context mixing formula
		o: temporary variable for indexing into the current word
		
		This "if" will skip on the first letter of a word, because all 26 letters are valid as first letters. That is,
		we don't run the context models/mixer on the first letters.
		*/
		if(k=f.toString(36),t=u=0,o=m++)
		{
			//n: vowel pattern of current word
			n=[...p].map(x=>/[aeiouy]/.test(x)),
			
			//Temp variables used to decide which context models need to be applied
			g=m>2;
			l=m>3;
			
			/*
			Definition of context models. Format is:
			[ context mixer coefficient, ID of context used for calculating weight, context mixer exponent, ID of context ]
			See my article on "Modeling 5 letter English words" for description of what these context models are.
			*/
			s=[
				[10,v=m+k+M,0,v],
				[1,v=m+~g+(a=k+p[--o])+M,.0,v],
				[10*g,y=v+(w=p[--o]),0,y],
				[10*g,y,0,v=m+a+n[o]],
				[1*l,y,1.0,m+a+w+p[--o]],
				[10*l,y,1,v+n[o]]
			];
			
			for(
				/*
				Context mixing formula.
				Context models are initialized with counts of [.10, .10].
				*/
				s.map(x=>t-=Math.log((r[x[3]]=r[x[3]]||[.10,.10])[u+=v=x[0]*(r[x[1]][1]+r[x[1]][0])**x[2],1]/r[x[3]][0])*v);
				h<1e4; //Condition to collect more data for arithmetic decoder
				c=c*138+e[i++] //Collect more data for arithmetic decoder
			)
				h*=138; //Expand interval after collecting more data for arithmetic decoder
			
			//t: threshhold for a true bit in the arithmetic decoder
			h-=t=h/(1+Math.exp(t/u))|0,
			
			//Update context counts
			s.map(x=>{
				//Apply decay to counts
				r[x[3]][0]*=.99;
				r[x[3]][1]*=.99;
				
				//Add 1 to count for bit we got
				r[x[3]][+(c<t)]++
			})
		}
};

//Run main function starting with empty string
r``