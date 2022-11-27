import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ImageBackground,
  Button,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SecureStore from "expo-secure-store";

const Stack = createNativeStackNavigator();

export const ThemeContext = React.createContext();

function makeRequest(method, url) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}

async function save(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export default function App() {
  const [loaded] = useFonts({
    Satoshi: require("./assets/fonts/Satoshi-Regular.ttf"),
    SatoshiSemibold: require("./assets/fonts/Satoshi-Bold.ttf"),
  });

  const [theme, setTheme] = useState(DarkTheme);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <NavigationContainer theme={theme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Loading"
            component={LoadScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Log in"
            component={LoginScreen}
            options={{ headerTransparent: true }}
          />
          <Stack.Screen
            name="Chats"
            component={ChatsScreen}
            options={{ headerTransparent: true, headerBackVisible: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

const LoadScreen = ({ navigation }) => {
  const userExists = async () => {
    const isUser = await SecureStore.getItemAsync("username");
    if (isUser) {
      let result = await makeRequest(
        "GET",
        "https://PowerUI-Chat-4-Backend.skywarspro15.repl.co/createAccount.php?user=" +
          encodeURI(await SecureStore.getItemAsync("username")) +
          "&auth=" +
          encodeURI(await SecureStore.getItemAsync("password"))
      );
      if (result.trim() == "New user" || result.trim() == "Existing user") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Chats" }],
        });
      } else if (result.trim() == "Password's not valid") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
        Alert.alert("Unable to log in", "Invalid password.", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      } else if (result.trim() == "Not a valid user") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
        Alert.alert("Unable to log in", "No such user: " + username, [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      }
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  };

  useEffect(() => {
    userExists();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFF" />
      <StatusBar style="light-content" />
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://source.unsplash.com/random/1080x1920/?connection",
        }}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.heading}>PowerUI Chat</Text>
          <Text style={styles.paragraph}>A place where people meet.</Text>
          <Text style={styles.heading}></Text>
          <Text style={styles.paragraph}>Get started:</Text>

          <View style={styles.buttons}>
            <Button
              color="#252525"
              title="Sign up"
              onPress={() =>
                Linking.openURL(
                  "https://cloudwebv2.skywarspro15.repl.co/index.php"
                )
              }
            ></Button>
            <Text style={styles.paragraph}> or </Text>
            <Button
              color="#252525"
              title="Log in"
              onPress={() => navigation.navigate("Log in")}
            ></Button>
          </View>
        </View>
      </ImageBackground>
      <StatusBar style="light-content" />
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [theme, setTheme] = useState(DarkTheme);
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [loginStatus, setStatus] = useState("");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <View style={styles.container} theme={theme}>
        <ImageBackground
          source={{
            uri: "https://source.unsplash.com/random/1080x1920/?connection",
          }}
          resizeMode="cover"
          style={styles.background}
          blurRadius={100}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.heading}>PowerUI Chat</Text>
            <Text style={styles.paragraph}>Log in to continue chatting.</Text>
            <Text style={styles.paragraph}></Text>
            <TextInput
              placeholderTextColor="#FFF"
              style={styles.input}
              placeholder="Username"
              onChangeText={(newText) => setUser(newText)}
            />
            <Text style={styles.paragraph}></Text>
            <TextInput
              placeholderTextColor="#FFF"
              style={styles.input}
              placeholder="Password"
              secureTextEntry={true}
              onChangeText={(newText) => setPass(newText)}
            />
            <Text style={styles.paragraph}></Text>
            <View style={styles.buttons}>
              <Button
                color="#252525"
                title="Log in"
                onPress={async () => {
                  setStatus("Logging in...");
                  let result = await makeRequest(
                    "GET",
                    "https://PowerUI-Chat-4-Backend.skywarspro15.repl.co/createAccount.php?user=" +
                      encodeURI(username) +
                      "&auth=" +
                      encodeURI(password)
                  );
                  if (
                    result.trim() == "New user" ||
                    result.trim() == "Existing user"
                  ) {
                    save("username", username);
                    save("password", password);
                    setStatus(
                      "Hello, " +
                        (await SecureStore.getItemAsync("username")) +
                        "!"
                    );
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Chats" }],
                    });
                  } else if (result.trim() == "Password's not valid") {
                    setStatus("");
                    Alert.alert("Unable to log in", "Invalid password.", [
                      { text: "OK", onPress: () => console.log("OK Pressed") },
                    ]);
                  } else if (result.trim() == "Not a valid user") {
                    setStatus("");
                    Alert.alert(
                      "Unable to log in",
                      "No such user: " + username,
                      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
                    );
                  }
                }}
              ></Button>
            </View>
            <Text style={styles.paragraph}></Text>
            <Text style={styles.paragraph}> {loginStatus} </Text>
          </View>
        </ImageBackground>
        <StatusBar style="light-content" />
      </View>
    </ThemeContext.Provider>
  );
};

const ChatsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light-content" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E0E",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: "white",
    fontFamily: "SatoshiSemibold",
    fontSize: 20,
    opacity: 1,
  },
  paragraph: {
    color: "white",
    fontFamily: "Satoshi",
    fontSize: 15,
    opacity: 1,
  },
  innerContainer: {
    backgroundColor: "rgba(0,0,0, 0.60)",
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  buttons: {
    flex: 0.1,
    flexDirection: "row",
    width: "100%",
    height: 10,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgb(8,8,8)",
  },
  input: {
    paddingLeft: 10,
    fontFamily: "Satoshi",
    backgroundColor: "rgba(25,25,25, 0.5)",
    color: "white",
    borderColor: "rgb(80,80,80)",
    width: "80%",
    height: "5%",
    borderRadius: 5,
    fontSize: 12,
  },
});
