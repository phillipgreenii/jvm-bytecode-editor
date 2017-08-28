import java.io.Serializable;
abstract class Simple implements Serializable{
  public final static long MY_LONG = 7882L;
  private String name;
  public String getName() {return name;}
  public void catchException() {
    try{
      System.out.println("In Try");
    } catch(RuntimeException ex) {
      System.out.println("In Catch:" + ex);
    } finally {
      System.out.println("In Finally");
    }
  }
  public void throwException() throws Exception {
    throw new Exception("exception being thrown");
  }
  public boolean methodWithParameters(int i, float f, String s, Object... stuff) {
    return false;
  }
  static class SimpleInner {
	public int getNumber() {return 2;}
	public int add(int a, int b) { final int sum = a + b; return sum;}
  }
}
