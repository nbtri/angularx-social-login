import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/user';
import { LoginOpt } from '../auth.service';

declare let FB: any;

export class FacebookLoginProvider extends BaseLoginProvider {

  public static readonly PROVIDER_ID = 'FACEBOOK';

  constructor(
    private clientId: string,
    private opt: LoginOpt = { scope: 'email,public_profile' },
    private locale: string = 'vi_VN',
    private fields: string = 'name,email,picture,first_name,last_name',
    private version: string = 'v2.9',
    private sdk: string = 'xfbml.customerchat'
  ) { super(); }

  asyncInit(): Promise<void> {
    return new Promise((resolve, reject) => {
        FB.init({
          appId: this.clientId,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: true,
          version: this.version
        });
      });
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      /*$window.fbAsyncInit = () => { 
        FB.init({
          appId: this.clientId,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: true,
          version: this.version
        });
      }*/

      this.loadScript(FacebookLoginProvider.PROVIDER_ID,
        `//connect.facebook.net/${this.locale}/${this.sdk}.js`,
        () => {
          /*FB.init({
            appId: this.clientId,
            autoLogAppEvents: true,
            cookie: true,
            xfbml: true,
            version: this.version
          });*/
          console.log("Loaded FB Customer-chat sdk");

          // FB.AppEvents.logPageView(); #FIX for #18

          this._readyState.next(true);
          resolve();
        });
    });
  }

  getLoginStatus(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      this.onReady().then(() => {
        FB.getLoginStatus((response: any) => {
          if (response.status === 'connected') {
            let authResponse = response.authResponse;
            FB.api(`/me?fields=${this.fields}`, (fbUser: any) => {
              let user: SocialUser = new SocialUser();

              user.id = fbUser.id;
              user.name = fbUser.name;
              user.email = fbUser.email;
              user.photoUrl = 'https://graph.facebook.com/' + fbUser.id + '/picture?type=normal';
              user.firstName = fbUser.first_name;
              user.lastName = fbUser.last_name;
              user.authToken = authResponse.accessToken;

              user.facebook = fbUser;

              resolve(user);
            });
          }
        });
      });
    });
  }

  signIn(opt?: LoginOpt): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      this.onReady().then(() => {
        FB.login((response: any) => {
          if (response.authResponse) {
            let authResponse = response.authResponse;
            FB.api(`/me?fields=${this.fields}`, (fbUser: any) => {
              let user: SocialUser = new SocialUser();

              user.id = fbUser.id;
              user.name = fbUser.name;
              user.email = fbUser.email;
              user.photoUrl = 'https://graph.facebook.com/' + fbUser.id + '/picture?type=normal';
              user.firstName = fbUser.first_name;
              user.lastName = fbUser.last_name;
              user.authToken = authResponse.accessToken;

              user.facebook = fbUser;

              resolve(user);
            });
          } else {
            reject('User cancelled login or did not fully authorize.');
           }
        }, this.opt);
      });
    });
  }

  signOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.onReady().then(() => {
        FB.logout((response: any) => {
          resolve();
        });
      });
    });
  }

}
