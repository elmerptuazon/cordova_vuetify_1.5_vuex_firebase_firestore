<template>
  <div>
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <v-toolbar-title>Terms and Conditions</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <p
            class="MsoNormal"
            align="center"
            style="margin-bottom:0cm;margin-bottom:.0001pt;
text-align:center;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              >TERMS AND CONDITIONS</b
            >
          </p>

          <p
            class="MsoNormal"
            align="center"
            style="margin-bottom:0cm;margin-bottom:.0001pt;
text-align:center;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              >{{ $store.getters["GET_COMPANY"] }} RESELLER MOBILE APP</b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <b style="mso-bidi-font-weight:normal"
              ><i style="mso-bidi-font-style:normal">&nbsp;</i></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><i style="mso-bidi-font-style:normal"
                >Last updated 10<sup>TH</sup> June 2019</i
              ></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;text-indent:35.45pt;line-height:normal;mso-outline-level:1"
          >
            Whereas, Fetch is a corporation organized and doing business under
            the laws of the Republic of the Philippines, with principal place of
            business at Inoza Tower, 40th Street, Taguig, Metro Manila, is
            engaged in the principal line of business known as direct selling;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;text-indent:35.45pt;line-height:normal;mso-outline-level:1"
          >
            Whereas, “APPSELL” is a business entity incorporated and duly
            registered in the Philippines under the name of DirectApp, Inc.,
            with principal place of business at
            <span style='mso-fareast-font-family:"Times New Roman"'
              >Level 10-1, 25th Street &amp; 5th Avenue, Bonifacio Global City,
              Taguig, 1632, Philippines</span
            >. APPSELL is the mobile application service provider of Fetch.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>OPT-IN / CONSENT:</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <span
              style="mso-tab-count:
1"
            >
            </span
            >These Terms and Conditions (&quot;Terms&quot;) shall govern the use
            of the {{ $store.getters["GET_COMPANY"] }} Reseller mobile app (the
            “App”), provided by APPSELL. By using and accessing the App, you
            signify that you have read, understand, and agree to be bound by
            these Terms, regardless of whether you have registered to use any of
            the services offered on the App (“Services”).
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>DEFINITION OF TERMS:</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <span
              style="mso-tab-count:
1"
            >
            </span
            >The following terminology applies to these Terms: &quot;We&quot;,
            &quot;us&quot; and <span class="GramE">&quot;our&quot;</span> refer
            to APPSELL. <span style="mso-spacerun:yes"> </span>“User”, “you” and
            “<span class="GramE">your</span>” refers to you, the user, or a
            visitor of this App.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>“Direct Selling Companies”
            refer to organizations that manufacture or source products for
            resale by Resellers. They represent merchants or business partners
            (not employers) of resellers.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>“Products” refer to any
            products, goods, or services of Direct Selling Companies being
            marketed by or offered for sale by Resellers.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>“Resellers” refers to Reseller
            users of this App. Resellers are clients of Direct Selling Companies
            and Merchants for Customers/Purchasers.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>“Customers/Purchasers” refers
            to consumers or buyers of Products who are clients of Resellers.
            Customers/Purchasers may or may not be Customer users of this App.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          ></p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>“Company Content” refers to
            any logos, images, photos, sounds, music, videos, interactive
            features, product descriptions, product information, documents and
            the like, that were originally created by or provided to AppSell by
            Fetch. Company Content is the sole property of Fetch.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>“App Content” refers to the
            metadata, software and scripts generated by AppSell in order to
            provide the {{ $store.getters["GET_COMPANY"] }} Reseller app for use
            by Reseller Users and Customer Users. App Content is the sole
            property of AppSell.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          ></p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>OUR SERVICES</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-bidi-font-weight:bold">&nbsp;</span>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-bidi-font-weight:bold"
              ><span style="mso-tab-count:1"> </span>The App</span
            >
            provides Customer users with a catalogue of products that Customer
            users can browse and from which they can select products to order
            from their Reseller. The App enables the Customer users to place
            orders with their Reseller and to review their previously placed
            orders. The App also enables Customer users to share product
            information using a range of social media channels.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;line-height:
normal"
          >
            <span style="mso-tab-count:1"> </span>The App provides Reseller
            users with the same catalogue of products and enables Resellers to
            receive orders directly from their Customers or to record orders on
            the behalf of their Customers. The App also enables Resellers to
            record and review supplementary information relating to placed
            orders and to share product information using a range of social
            media channels.<b
              style="mso-bidi-font-weight:
normal"
              ><u></u
            ></b>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u><span style="text-decoration:none">&nbsp;</span></u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u
                >MEMBERSHIP ACCOUNT REGISTRATION / ACCESS / OPT-OUT /
                CANCELLATION / TERMINATION</u
              ></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>You need to create an account
            and provide information about yourself in order to use some of the
            features on the App. To register an account, simply fill out and
            submit the form on the App’s ‘Sign Up’ page.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>Each time you use a password
            or identification, you will be deemed to be authorized to access and
            use the App in a manner consistent with the Terms, and APPSELL has
            no obligation to investigate the authorization or source of any such
            access or use of the App. You are responsible for maintaining the
            confidentiality of your account password and login information. You
            are also responsible for all activities that occur in connection
            with your account. You agree to notify us immediately of any
            unauthorized use of your account. We trust that you know that
            sharing your password or login information compromises the security
            of your account.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>Your account is for your
            personal use only. When you register for an account, you agree to
            provide current, complete, and accurate information about yourself.
            If any information you provide is untrue, inaccurate, not current,
            or incomplete, we have the right to cancel your registration, reject
            any application you have submitted, terminate any agreement we have
            with you, and restrict your future use of the App and our Services.
            We reserve the right to reject any registration and/or decline any
            application for registration.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>You are free to cancel your
            account any time by emailing
            <i
              style="mso-bidi-font-style:
normal"
              >info.appsell@gmail.com</i
            >. If you have questions on closing and cancelling your account,
            please email us at
            <i style="mso-bidi-font-style:normal">info.appsell@gmail.com</i>.
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>We may immediately terminate
            your account, without notice, for any conduct that we believe or
            suspect: (<span class="SpellE">i</span>) violates these Terms or the
            law; or (ii) is harmful or potentially harmful to other Users' or
            our business interests; or (iii) for an inactive account. A User’s
            account becomes inactive when it is without activity or has no
            transaction for a continuous and uninterrupted period of 12 months.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <a name="_Hlk536665164"
              ><b style="mso-bidi-font-weight:normal"
                ><u>COLLECTION AND USE OF PERSONAL INFORMATION</u></b
              ></a
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>You may be asked to provide
            your Personal Information anytime you use the App or Services. We
            may share this personal information and use it consistent with the
            Terms and Privacy Policy of APPSELL. We may also combine it with
            other information to provide and improve our products, services, App
            Content, Company Content and advertising.
            <span style="mso-spacerun:yes"> </span>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>We may gather some information
            automatically and store such information in log files. This
            information includes internet addresses, browser types and
            languages, operating systems, date/time stamps, etc. We use this
            information to understand and analyze trends, to administer the App,
            to learn about user behavior on the App, to improve APPSELL’s
            product and services, or products and services which are being
            resold or offered by Resellers. We may also collect information to
            gather demographic information about APPSELL’s user base as a whole.
            We may use this information in our marketing and advertising
            services.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <a name="_Hlk536665422"
              ><b style="mso-bidi-font-weight:normal"
                ><u>CONTACT DETAILS POLICY</u></b
              ></a
            ><b style="mso-bidi-font-weight:normal"><u></u></b>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>By providing your electronic
            mail address and/or cell phone number and using the Service, you
            understand that such amounts to your consent to our use of your
            electronic mail address and/or cell phone number for calls, text
            messages, and electronic mails in order to perform and improve upon
            the Service. While we do not charge you for messages and calls, your
            mobile network may charge you for said messages and calls. Under no
            circumstances will we be responsible for any text messaging or
            wireless charges incurred by you. Data obtained from you in
            connection with this text messaging service may include your cell
            phone number, your provider's name, and the date, time, and content
            of your messages. We may use this information to contact you and to
            provide the Services you request from us.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>USERS’ OBLIGATIONS</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              >&nbsp;</b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              >Resellers</b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <span
              style="mso-tab-count:
1"
            >
            </span
            >By using the App in the marketing and distribution of Direct
            Selling Companies’ Products, Resellers adhere to distribute the
            Direct Selling Companies’ Products in accordance with the industry
            standards and according to any terms already agreed upon with the
            Direct Selling Company. Resellers shall have the sole responsibility
            to connect the Direct Selling Companies to Resellers’ networks and
            base clients. Resellers assume full responsibility to introduce
            Direct Selling Companies’ Products for their marketability. APPSELL
            shall in no case be liable for Resellers’ failure to perform their
            commitments and obligations to Direct Selling Companies.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              >Customers/Purchasers</b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <span
              style="mso-tab-count:
1"
            >
            </span
            >By using the App in purchasing or placing orders to Direct Selling
            Companies through Resellers, Customers understand that
            <span
              style='mso-fareast-font-family:"Times New Roman";mso-bidi-font-family:Arial;
color:#222222'
              >any claim for refund or enforcement of warranties are to be
              addressed to Direct Selling Companies. APPSELL shall in no case be
              responsible for the representations made by Direct Selling
              Companies or Resellers. Customers also understand that all product
              information made available in the App is the responsibility of
              Resellers or Direct Selling Companies.</span
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>RESTRICTIONS ON USE</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>You must not post, send or
            otherwise transmit to or through the App any unlawful, infringing,
            harmful, harassing, defamatory, threatening, vulgar, sexually
            explicit, racist, violent, immoral, religiously offensive, hateful,
            or otherwise objectionable material of any kind, any material that
            exploits children or is invasive of or in breach of another person's
            privacy or other rights or any material that APPSELL
            <b style="mso-bidi-font-weight:normal"
              ><u>in its sole discretion</u></b
            >
            does not wish posted or transmitted on the App or mobile
            application; defame, abuse, harass, stalk, threaten, or otherwise
            violate the legal rights (such as rights of privacy and publicity)
            of others; upload or otherwise make available, files that contain
            images, software, or other material protected by intellectual
            property laws, including without limitation copyright, patents,
            designs or trademark laws and rights of confidentiality, publicity,
            and privacy unless you own or control the rights thereto or have
            received all necessary authorizations to do the same; misrepresent
            your identity or affiliation in any way; engage in deceptive online
            marketing; violate any applicable laws or regulations; or assist or
            permit any persons in engaging in any of the activities described
            above.<span style="mso-spacerun:yes"> </span>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <u
              ><span
                style="mso-bidi-font-family:Helvetica;
background:whitesmoke"
                ><span style="text-decoration:none">&nbsp;</span></span
              ></u
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;line-height:
normal;background:white"
          >
            <b style="mso-bidi-font-weight:normal"
              ><u
                ><span
                  style='mso-fareast-font-family:"Times New Roman";mso-bidi-font-family:Helvetica'
                  >DISCLOSURE TO THIRD PARTIES</span
                ></u
              ></b
            ><span
              style='mso-fareast-font-family:"Times New Roman";
mso-bidi-font-family:Helvetica'
              ><br style="mso-special-character:line-break" />
              <br style="mso-special-character:line-break" />
            </span>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;background:white"
          >
            <span
              style='mso-fareast-font-family:
"Times New Roman";mso-bidi-font-family:Helvetica'
              ><span
                style="mso-tab-count:
1"
              >
              </span
              >At times we may make certain personal information available to
              Partners or affiliates, Resellers and/or clients that work with us
              to provide Products and Services, or that help us market to
              Partners and Sponsors. Personal information will only be shared by
              us to provide or improve our Products, Services and advertising;
              such information will not be shared in any case with third parties
              or Partners for their marketing purposes. Your usage of this App
              means your consent to allow us to share your data or information
              pursuant to these Terms.</span
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1;background:white"
          >
            <b style="mso-bidi-font-weight:normal"
              ><u
                ><span
                  style='mso-fareast-font-family:
"Times New Roman";mso-bidi-font-family:Helvetica'
                  ><span
                    style="text-decoration:
 none"
                    >&nbsp;</span
                  ></span
                ></u
              ></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1;background:white"
          >
            <b style="mso-bidi-font-weight:normal"
              ><u
                ><span
                  style='mso-fareast-font-family:
"Times New Roman";mso-bidi-font-family:Helvetica'
                  >INTELLECTUAL PROPERTY</span
                ></u
              ></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;background:white"
          >
            <u
              ><span
                style='mso-fareast-font-family:
"Times New Roman";mso-bidi-font-family:Helvetica'
                ><span
                  style="text-decoration:
 none"
                  >&nbsp;</span
                ></span
              ></u
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;background:white"
          >
            <span
              style='mso-fareast-font-family:
"Times New Roman";mso-bidi-font-family:Helvetica'
              ><span
                style="mso-tab-count:
1"
              >
              </span
              >The App, Application, Services, and App Content are protected by
              copyright, trademark, and other laws of the Republic of the
              Philippines. You acknowledge and agree that the App, Services, and
              App Content, including all associated intellectual property
              rights, are the exclusive property of APPSELL. You shall not use,
              copy, reproduce, republish, upload, post, transmit, distribute or
              modify the Marks owned by APPSELL, App Content, or its copyright
              in any way, including in advertising or publicity pertaining to
              distribution of materials on this App, without our prior written
              consent.<span style="mso-spacerun:yes"> </span>Trademarks, service
              marks, logos, trade names and any other proprietary designations
              of third parties used on or in connection with the App or Services
              are used for identification purposes only and may be the property
              of their respective owners. As a User, you understand and agree
              that you are bound by these Terms on Intellectual Property.</span
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;background:white"
          >
            <u
              ><span
                style='mso-fareast-font-family:
"Times New Roman";mso-bidi-font-family:Helvetica'
                ><span
                  style="text-decoration:
 none"
                  >&nbsp;</span
                ></span
              ></u
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>MODIFICATION OF TERMS</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>We reserve the right to modify
            the App or Services or to modify these Terms at any time and without
            prior notice.
            <b style="mso-bidi-font-weight:normal"
              ><i style="mso-bidi-font-style:normal"
                >If we modify these Terms, we shall update the &quot;Last
                Updated&quot; date at the top of these Terms.</i
              ></b
            >
            By continuing to access or use the App or Service after we posted a
            modification, you indicate that you agree to be bound by the
            modified Terms. If the modified Terms are not acceptable to you,
            your only recourse is to cease using the App or Services and
            canceling your account by emailing
            <i
              style="mso-bidi-font-style:
normal"
              >info.appsell@gmail.com</i
            >.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <u><span style="text-decoration:none">&nbsp;</span></u>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>LINKS TO OTHER APPS</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>Our Services may contain links
            to third party Apps or services that are not owned or controlled by
            us. We have no control over, and assume no responsibility for, the
            content, privacy policies, or practices of any
            <span class="GramE">third party</span> Apps or services. You further
            acknowledge and agree that we shall not be responsible or liable,
            directly or indirectly, for any damage or loss caused or alleged to
            be caused by or in connection with use of or reliance on any such
            content, goods or services available on or through any such Apps or
            services.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>LIMITATIONS ON LIABILITY</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>We specifically disclaim any
            liability and in no event shall APPSELL, its officers, directors,
            shareholders, or employees be liable for any direct, indirect,
            incidental, consequential, punitive, or special damages or any other
            damages of any kind, including but not limited to loss of use, loss
            of profits or loss of data, whether in an action in contract, tort,
            strict liability or otherwise (including but not limited to
            negligence), arising out of or in any way connected with access to
            or use of this App and/or Services and even if we have been advised
            of the possibility of such damages, including liability associated
            with any viruses, macros, or other disabling software that may
            infect your computer equipment. You specifically acknowledge that we
            shall not be liable for user submissions or the defamatory,
            offensive or illegal conduct of any third party and that the risk of
            harm or damage from the foregoing rests entirely with you.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>WARRANTIES AND REPRESENTATIONS</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>By using this App and/or
            Services, you are solely responsible for all of your communications
            and interactions with other Users and Partners and with other
            persons with whom you communicate or interact as a result of your
            use of the App or Services. We do not have control over the quality,
            timing, legality, failure to provide, or any other aspect whatsoever
            of any Products, nor of the integrity, responsibility or any of the
            actions or omissions whatsoever of any Users or Resellers. We make
            no representations about the suitability, reliability, timeliness,
            or accuracy of the Products requested and provided by merchant
            partners identified through the App whether in public, private, or
            offline interactions.
            <u
              >Resellers featured in this App are independent contractors, and
              are not in any way employees, agents, co-<span class="SpellE"
                >venturers</span
              >, or representatives of APPSELL.</u
            >
            You agree to take reasonable precautions in all communications and
            interactions with other users of the App or Services and with other
            persons with whom you communicate or interact as a result of your
            use of the App or Services, particularly if you decide to meet
            outside the premises of this App or Service.<span
              style="mso-spacerun:yes"
            >
            </span
            >We explicitly disclaim all liability for any act or omission of any
            guest or other third party.<b
              style="mso-bidi-font-weight:normal"
            ></b>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>While we take best efforts to
            confirm and verify the identity and reputation of each Reseller,
            Direct Selling Companies and/or Clients, we cannot entirely confirm
            that each User is who they claim to be. We do not assume any
            responsibility for the accuracy or reliability of this information
            or any information provided through the App. When interacting with
            Resellers, Direct Selling Companies and/or Customers, you should
            exercise caution and common sense to protect your personal safety
            and property, just as you would when interacting with other persons
            whom you do not know. Neither APPSELL nor its affiliates or
            partners, is responsible for the conduct, whether online or offline,
            of any user of the App. APPSELL nor its affiliates or partners will
            not be liable for any claim, injury or damage arising in connection
            with your use of the App or any of its services.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>We do not represent or warrant
            that this App or Service are free of viruses or other harmful
            components, and you bear the entire risk of losses or damages that
            you may incur or suffer as a result of any use of or visit to this
            App. We do not guarantee continuous, uninterrupted, error-free, or
            secure access to this App or Service, since the operation of this
            App may be interfered with by numerous factors outside of our<i
              style="mso-bidi-font-style:normal"
            >
            </i
            >control.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>INDEMNITY</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>You agree to defend,
            indemnify, and hold APPSELL harmless from any and all liabilities,
            costs, and expenses, including reasonable attorneys' fees, related
            to or in connection with: (a) the use of the App or the Internet or
            your placement or transmission of any message or information on this
            App by you or your authorized users; (b) your violation of any of
            these Terms, including without limitation, your breach of any of the
            representations and warranties above; (c) your violation of any
            third party rights, including without limitation any rights of
            privacy, publicity rights or intellectual property rights; (d) your
            violation of any law, rule or regulation of the Republic of the
            Philippines or any other country; (e) any claim or damages that
            arise as a result of any user submission that you provide to
            APPSELL; or (f) any other party's access to and use of this App with
            your unique username, password, or other appropriate security code.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <b style="mso-bidi-font-weight:normal"
              ><u><span style="text-decoration:none">&nbsp;</span></u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>GOVERNING LAW AND CHOICE OF VENUE</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>These Terms shall be solely
            and exclusively governed by and construed in accordance with the
            laws of the Republic of the Philippines, regardless of where any
            Customer users or Reseller users resides, does business, or
            transacts, or, where any transaction or part thereof took place.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            <span style="mso-tab-count:1"> </span>Any dispute arising out of
            these Terms shall be filed solely and exclusively in the appropriate
            courts of Makati, to the exclusion of all other fora or venues,
            regardless of where any Customer users or Reseller users resides,
            does business, or transacts, or, where any transaction or part
            thereof took place.<b style="mso-bidi-font-weight:normal"></b>
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;text-align:
justify;line-height:normal;mso-outline-level:1"
          >
            <b
              style="mso-bidi-font-weight:
normal"
              ><u>ADDITIONAL ASSISTANCE</u></b
            >
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;line-height:
normal"
          >
            &nbsp;
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;line-height:
normal"
          >
            <span style="mso-tab-count:1"> </span>It is your responsibility to
            review these Terms regularly. We may revise these Terms at any time
            without prior notice to you.
            <span style="mso-spacerun:yes"> </span>If you do not understand any
            of the foregoing Terms or if you have any questions or comments, we
            invite you to contact us at
            <span class="MsoHyperlink">info.appsell@gmail.com</span>. If at any
            time you find these Terms unacceptable or if you do not agree to
            these Terms, please do not use this App.
          </p>

          <p
            class="MsoNormal"
            style="margin-bottom:0cm;margin-bottom:.0001pt;line-height:
normal"
          >
            &nbsp;
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: false
  }),
  methods: {
    show() {
      this.dialog = true;
    }
  }
};
</script>
