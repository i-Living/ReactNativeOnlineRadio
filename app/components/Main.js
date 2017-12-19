import React, {Component} from 'react';
import {
  AppRegistry,
  AsyncStorage,
  Button,
  StyleSheet,
  Text,
  View,
  ListView,
  Platform,
  Modal,
  TextInput,
  TouchableOpacity
} from 'react-native';
import {ReactNativeAudioStreaming, Player} from 'react-native-audio-streaming';

let Record = {
  name: 'Radio Record',
  url: 'http://air.radiorecord.ru:805/rr_320'
}
let Chillout = {
  name: 'Record Chillout',
  url: 'http://air.radiorecord.ru:805/chil_320'
}
let stations = [Record, Chillout]

export default class Main extends Component {

  addStation = async () => {
    try {
      let newStation = {
        name: this.state.stationName,
        url: this.state.stationUrl
      }
      stations.push(newStation)
      AsyncStorage.setItem('stations', JSON.stringify(stations))
      this.state.dataSource = this.ds.cloneWithRows(stations)

      this.clearModal();
      this.toggleModal(!this.state.modalVisible);
    } catch (e) {
      alert(e)
    }
  }

  deleteStation = async () => {
    try {
      this.getFirstStation().then(data => {
        this.setState({selectedSource: stations[data].url, dataSource: this.ds.cloneWithRows(stations)})
      })
      var indexToRemove = stations.findIndex(obj => obj.name == this.state.deletingStation)
      stations.splice(indexToRemove, 1)
      this.setState({selectedSource: stations[0].url, dataSource: this.ds.cloneWithRows(stations)})
      AsyncStorage.setItem('stations', JSON.stringify(stations))
    } catch (e) {
      alert(e)
    }
  }

  updateStations = async () => {
    try {
      let storageStations = await AsyncStorage.getItem('stations')
      let parsedSations = JSON.parse(storageStations)
      stations = parsedSations
    } catch (e) {
      alert(e)
    }
  }

  getFirstStation = async () => {
    try {
      let storageStations = await AsyncStorage.getItem('stations')
      let parsedSations = JSON.parse(storageStations)
      return Object.keys(parsedSations)[0]
    } catch (e) {
      alert(e)
    }
  }

  toggleModal(visible) {
    this.setState({modalVisible: visible});
  }

  cancelAdding() {
    this.clearModal();
    this.toggleModal(!this.state.modalVisible);
  }

  clearModal() {
    this.state.stationName = ''
    this.state.stationUrl = ''
  }

  constructor() {
    super();
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.updateStations()

    this.state = {
      stations: stations,
      dataSource: this.ds.cloneWithRows(stations),
      selectedSource: '',
      stationName: '',
      stationUrl: '',
      deletingStation: '',
      modalVisible: false
    };
    this.getFirstStation().then(data => {
      this.setState({selectedSource: stations[data].url, dataSource: this.ds.cloneWithRows(stations)})
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>React Native Online Radio</Text>

          <TouchableOpacity onPress={() => {
              this.toggleModal(true)
            }} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType={"slide"}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => { console.log("Modal has been closed.") }}>
          <View style={styles.modal}>
            <Text style={styles.modalText}>Name</Text>
            <TextInput style={styles.inputStyle} onChangeText={(stationName) => this.setState({stationName})} underlineColorAndroid='transparent'></TextInput>
            <Text style={styles.modalText}>Url</Text>
            <TextInput style={styles.inputStyle} onChangeText={(stationUrl) => this.setState({stationUrl})} underlineColorAndroid='transparent'></TextInput>

            <View style={styles.modalBtnsFooter}>
              <TouchableOpacity onPress={() => {
                  this.addStation()
                }} style={styles.modalButton}>
                <Text style={styles.modalBtnText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                  this.cancelAdding()
                }} style={styles.modalButton}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ListView style={styles.content}
          dataSource={this.state.dataSource}
          renderRow={(rowData) =>
          <TouchableOpacity onPress={() => {
              this.setState({selectedSource: rowData.url})
              ReactNativeAudioStreaming.play(rowData.url, {})
            }}>
            <View style={StyleSheet.flatten([styles.row, {backgroundColor: rowData.url === this.state.selectedSource ? '#3fb5ff' : 'white'}])}>
              <Text style={styles.playIcon}>▸</Text>
              <View style={styles.column}>
                <Text style={styles.name}>{rowData.name}</Text>
                <Text style={styles.url}>{rowData.url}</Text>
              </View>
              <View style={styles.delIcon}>
                <Button raised="raised" title='-' color='rgb(102, 102, 102)' onPress={() => {
                    this.setState({deletingStation: rowData.name})
                    this.deleteStation()
                  }}>
                </Button>
              </View>
            </View>
          </TouchableOpacity>}>
        </ListView>

        <View style={styles.footer}>
          <Player url={this.state.selectedSource}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingTop: 0
  },
  header: {
    height: 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    height: 'auto',
    width: '100%'
  },
  footer: {
    height: 80,
    width: '100%'
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    borderBottomColor: 'grey',
    borderBottomWidth: 1
  },
  column: {
    flexDirection: 'column'
  },
  playIcon: {
    fontSize: 26,
    width: 30,
    textAlign: 'center'
  },
  delIcon: {
    position: 'absolute',
    top: 5,
    right: 10,
    bottom: 5
  },
  inputStyle: {
    height: 30,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    padding: 5,
    margin: 5
  },
  name: {
    color: '#000'
  },
  url: {
    color: '#CCC'
  },
  addButton: {
    position: "absolute",
    zIndex: 11,
    right: 10,
    bottom: 10,
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4e4e4'
  },
  addButtonText: {
    fontSize: 24
  },
  modal: {
    backgroundColor: '#fff',
    borderWidth: 0.3,
    borderColor: '#333',
    position: 'absolute',
    bottom: 90,
    width: '100%',
    borderRadius: 7,
    padding: 10
  },
  modalBtnsFooter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    height: 30,
    width: 100,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e4e4e4',
    borderWidth: 0.5,
    borderColor: '#333',
    margin: 5
  },
  modalText: {
    marginLeft: 5
  }
});
